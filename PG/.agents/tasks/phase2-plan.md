# Phase 2 Implementation Plan — PG Mongoose Models & Seed Script

## Context

The server is a Node.js/Express + Mongoose project at `/Users/harshpanchal/Desktop/WAD Project/PG/server`.
It currently runs the old **multi-vendor marketplace** codebase. Phase 2 replaces every marketplace
model, clears the marketplace controllers/routes, rebuilds `server.js` for the PG system, installs
missing packages, and delivers a comprehensive seed script.

**Key facts discovered from reading the code:**

- `server.js` mounts 6 marketplace routes (`/api/auth`, `/api/shops`, `/api/products`, `/api/cart`, `/api/orders`, `/api/admin`) — all must be removed and replaced with only the health route for now (Phase 3 will add PG routes).
- `package.json` name is `"multi-vendor-marketplace-server"`, missing packages: `express-rate-limit`, `helmet`, `zod`, `node-cron`, `razorpay`, `morgan`.
- `utils/seeder.js` references old models (User, Shop, Product, Category, Cart, Order) — must be fully replaced.
- `test-suite.js` references old routes/models — must be replaced with a PG smoke test.
- `config/db.js` hardcodes `local-marketplace` as default DB name — must be updated to `pg-management`.
- `.env.example` has 6 keys; it must gain `JWT_REFRESH_SECRET`, `NODE_ENV`, `PAYMENT_PROVIDER`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NODE_CRON_TIMEZONE`.
- `middleware/authMiddleware.js` and `utils/generateToken.js` use old single-token approach — these will be rebuilt in Phase 3, so they stay untouched in Phase 2 (they are not imported by any of the 17 new model files or the seed script).
- `utils/generateToken.js` — keep as-is; Phase 3 will replace it.
- `config/cloudinary.js` — keep; already correct for PG use.
- `middleware/uploadMiddleware.js` — keep; already correct.

**17 models to create** (per the master spec):
`User`, `PG`, `Room`, `Bed`, `Resident`, `Staff`, `Payment`, `PaymentReceipt`,
`Complaint`, `ComplaintUpdate`, `Category` (PG-scoped), `Document`, `Notification`,
`Notice`, `Feedback`, `Enquiry`, `Counter` (for auto-incrementing REQ/receipt numbers).

**Counter** model is a deliberate addition not listed in the spec but required by it:
`Complaint.requestNo` ("REQ1024") and `PaymentReceipt.receiptNumber` are unique sequential
strings — the standard Mongoose pattern for this is a `Counter` collection. Without it,
concurrent cron jobs or simultaneous requests would race. One extra model is better than
broken business logic.

---

## Dependency Order

Steps must be executed in the numbered order. Each step leaves the server in a runnable state.

---

## Implementation Plan

- [ ] 1. **Install missing npm packages**

      Add `express-rate-limit`, `helmet`, `zod`, `node-cron`, `razorpay`, `morgan` to `dependencies`.
      Run `npm install` inside `/server`.

      Files: `server/package.json` (package manager will update `package-lock.json`)

      Command:
      ```bash
      cd "/Users/harshpanchal/Desktop/WAD Project/PG/server" && \
        npm install --save express-rate-limit@7.5.0 helmet@8.0.0 zod@3.24.2 node-cron@3.0.3 razorpay@2.9.5 morgan@1.10.0
      ```

      Verify: `npm ls express-rate-limit helmet zod node-cron razorpay morgan` — all 6 appear in the
      dependency tree with no missing-package errors.

---

- [ ] 2. **Delete old marketplace model files**

      Remove the 5 marketplace models that have no place in the PG system. The existing `User.js`
      is also deleted here because step 4 creates the PG-scoped replacement.

      Files to delete:
      - `server/models/Cart.js`
      - `server/models/Category.js`
      - `server/models/Order.js`
      - `server/models/Product.js`
      - `server/models/Shop.js`
      - `server/models/User.js`

      Do NOT delete `server/models/.gitkeep`.

      Command to verify deletion (should return no output):
      ```bash
      ls "/Users/harshpanchal/Desktop/WAD Project/PG/server/models/" | grep -E "^(Cart|Category|Order|Product|Shop|User)\.js$"
      ```

---

- [ ] 3. **Delete old marketplace controllers and routes**

      These files `require()` the deleted models. They must be removed before `server.js` is
      updated, or Node will throw `MODULE_NOT_FOUND` on startup.

      Files to delete:
      - `server/controllers/adminController.js`
      - `server/controllers/authController.js`
      - `server/controllers/cartController.js`
      - `server/controllers/orderController.js`
      - `server/controllers/productController.js`
      - `server/controllers/shopController.js`
      - `server/routes/adminRoutes.js`
      - `server/routes/authRoutes.js`
      - `server/routes/cartRoutes.js`
      - `server/routes/orderRoutes.js`
      - `server/routes/productRoutes.js`
      - `server/routes/shopRoutes.js`

      Do NOT delete `server/controllers/.gitkeep` or `server/routes/.gitkeep`.

      Verify:
      ```bash
      ls "/Users/harshpanchal/Desktop/WAD Project/PG/server/controllers/" && \
      ls "/Users/harshpanchal/Desktop/WAD Project/PG/server/routes/"
      ```
      Expected: only `.gitkeep` in each directory.

---

- [ ] 4. **Create the 17 PG Mongoose model files**

      Create each file in `server/models/`. All models follow these conventions:
      - Use `mongoose.Schema` with `{ timestamps: true }` unless stated otherwise.
      - Add all indexes specified in the master spec as `index: true` on field or as `schema.index({})` calls.
      - Enum values are exactly as specified (UPPERCASE constants).
      - `pgId` is `{ type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true, index: true }` on every tenant-scoped model.
      - `residentId` is `{ type: mongoose.Schema.Types.ObjectId, ref: 'Resident', index: true }` where applicable.

      ### 4a. `server/models/User.js`

      Fields: `role` (enum: ADMIN, RESIDENT, STAFF; required), `name` (String, required, trim),
      `email` (String, required, unique, lowercase, trim), `phone` (String, trim, default ''),
      `passwordHash` (String, required), `pgId` (ObjectId ref PG, index, sparse — null for admin
      before PG is assigned), `isActive` (Boolean, default true).

      Include a `comparePassword(candidate)` instance method using `bcryptjs.compare`.
      Include a pre-save hook that hashes `passwordHash` when modified (field name is `passwordHash`
      not `password` — this is intentional per the spec schema).

      Indexes: unique on `email`.

      ### 4b. `server/models/PG.js`

      Fields: `name` (String, required, trim), `address` (String, required),
      `contact` (String, trim, default ''), `amenities` ([String], default []),
      `photos` ([String], default []), `ownerId` (ObjectId ref User, required, index).

      ### 4c. `server/models/Room.js`

      Fields: `pgId` (required, index), `floor` (Number, required), `roomNumber` (String, required, trim),
      `type` (String, required — e.g. "Single", "Double", "Triple"),
      `capacity` (Number, required, min 1), `rent` (Number, required, min 0),
      `amenities` ([String], default []), `photos` ([String], default []).

      Indexes: `schema.index({ pgId: 1 })`, unique compound `schema.index({ pgId: 1, roomNumber: 1 }, { unique: true })`.

      ### 4d. `server/models/Bed.js`

      Fields: `pgId` (required, index), `roomId` (ObjectId ref Room, required, index),
      `label` (String, required, trim — e.g. "A", "B"),
      `status` (enum: AVAILABLE, OCCUPIED; default AVAILABLE),
      `residentId` (ObjectId ref Resident, default null).

      Indexes: `schema.index({ pgId: 1 })`, `schema.index({ roomId: 1 })`.

      ### 4e. `server/models/Resident.js`

      Fields: `userId` (ObjectId ref User, required, unique — one resident profile per user),
      `pgId` (required, index), `gender` (String, trim, default ''),
      `dob` (Date), `address` (String, trim, default ''),
      `emergencyContact` ({ name: String, phone: String }),
      `joiningDate` (Date, required), `roomId` (ObjectId ref Room, default null),
      `bedId` (ObjectId ref Bed, default null),
      `monthlyRent` (Number, required, min 0), `securityDeposit` (Number, default 0, min 0),
      `status` (enum: ACTIVE, NOTICE_PERIOD, CHECKED_OUT, PENDING_VERIFICATION; default PENDING_VERIFICATION).

      Indexes: `schema.index({ pgId: 1 })`, `schema.index({ pgId: 1, status: 1 })`.

      ### 4f. `server/models/Staff.js`

      Fields: `userId` (ObjectId ref User, required, unique), `pgId` (required, index),
      `category` ([String], default []), `isActive` (Boolean, default true).

      Indexes: `schema.index({ pgId: 1 })`.

      ### 4g. `server/models/Payment.js`

      Fields: `pgId` (required, index), `residentId` (ObjectId ref Resident, required, index),
      `month` (String, required, trim — format "YYYY-MM"), `amount` (Number, required, min 0),
      `paidAmount` (Number, default 0, min 0), `dueDate` (Date, required),
      `status` (enum: PENDING, PAID, PARTIALLY_PAID, OVERDUE, FAILED; default PENDING),
      `gatewayOrderId` (String, default ''), `transactionId` (String, default ''),
      `method` (String, default ''), `paidAt` (Date, default null).

      Indexes: `schema.index({ pgId: 1 })`, `schema.index({ pgId: 1, status: 1 })`,
      unique compound `schema.index({ residentId: 1, month: 1 }, { unique: true })`.

      ### 4h. `server/models/PaymentReceipt.js`

      Fields: `paymentId` (ObjectId ref Payment, required, unique),
      `receiptNumber` (String, required, unique, trim),
      `snapshot` ({
        residentName: String, residentEmail: String, pgName: String,
        roomNumber: String, bedLabel: String,
        month: String, amount: Number, paidAmount: Number,
        transactionId: String, paidAt: Date
      }).

      ### 4i. `server/models/Complaint.js`

      Fields: `pgId` (required, index), `requestNo` (String, required, unique, trim — e.g. "REQ1024"),
      `residentId` (ObjectId ref Resident, required, index),
      `roomId` (ObjectId ref Room, default null),
      `category` (String, required, trim), `priority` (enum: LOW, MEDIUM, HIGH, URGENT; default MEDIUM),
      `title` (String, required, trim), `description` (String, required, trim),
      `attachments` ([String], default []),
      `status` (enum: NEW, ASSIGNED, IN_PROGRESS, ON_HOLD, RESOLVED, CLOSED; default NEW),
      `assignedStaffId` (ObjectId ref Staff, default null).

      Indexes: `schema.index({ pgId: 1 })`, `schema.index({ pgId: 1, status: 1 })`,
      `schema.index({ residentId: 1 })`.

      ### 4j. `server/models/ComplaintUpdate.js`

      Fields: `complaintId` (ObjectId ref Complaint, required, index),
      `fromStatus` (String, required), `toStatus` (String, required),
      `note` (String, trim, default ''), `actorId` (ObjectId ref User, required).

      Timestamps: `true` (uses `createdAt` naturally).

      ### 4k. `server/models/Category.js` (PG-scoped — different from old marketplace Category)

      Fields: `pgId` (required, index), `name` (String, required, trim).

      Indexes: unique compound `schema.index({ pgId: 1, name: 1 }, { unique: true })`.

      ### 4l. `server/models/Document.js`

      Fields: `residentId` (ObjectId ref Resident, required, index),
      `type` (String, required, trim — e.g. "Aadhaar", "PAN", "Passport"),
      `url` (String, required), `publicId` (String, required, trim),
      `status` (enum: UPLOADED, VERIFIED, PENDING; default PENDING).

      Indexes: `schema.index({ residentId: 1 })`.

      ### 4m. `server/models/Notification.js`

      Fields: `userId` (ObjectId ref User, required, index),
      `type` (String, required, trim), `title` (String, required, trim),
      `message` (String, required, trim), `link` (String, default ''),
      `isRead` (Boolean, default false).

      Indexes: `schema.index({ userId: 1 })`.

      ### 4n. `server/models/Notice.js`

      Fields: `pgId` (required, index), `title` (String, required, trim),
      `body` (String, required), `createdBy` (ObjectId ref User, required).

      ### 4o. `server/models/Feedback.js`

      Fields: `pgId` (required, index), `residentId` (ObjectId ref Resident, required, index),
      `complaintId` (ObjectId ref Complaint, default null),
      `type` (String, required, trim), `rating` (Number, required, min 1, max 5),
      `comment` (String, trim, default '').

      ### 4p. `server/models/Enquiry.js`

      Fields: `pgId` (required, index), `name` (String, required, trim),
      `phone` (String, required, trim), `email` (String, trim, default '', lowercase),
      `roomId` (ObjectId ref Room, default null),
      `moveInDate` (Date), `message` (String, trim, default ''),
      `status` (enum: NEW, CONTACTED, CONVERTED, CLOSED; default NEW).

      Indexes: `schema.index({ pgId: 1 })`.

      ### 4q. `server/models/Counter.js`

      Purpose: provides atomic auto-incrementing sequences used for `requestNo` ("REQ1024") and
      `receiptNumber`. This is the standard MongoDB approach to avoid race conditions in concurrent
      requests or cron jobs.

      Fields: `_id` (String — the sequence name, e.g. "complaint_requestNo", "receipt_number"),
      `seq` (Number, default 0).

      No timestamps. Export a static helper `Counter.getNext(name)` that uses `findOneAndUpdate`
      with `{ $inc: { seq: 1 } }` and `upsert: true` to atomically increment and return the new value.

      Files (all of step 4):
      - `server/models/User.js`
      - `server/models/PG.js`
      - `server/models/Room.js`
      - `server/models/Bed.js`
      - `server/models/Resident.js`
      - `server/models/Staff.js`
      - `server/models/Payment.js`
      - `server/models/PaymentReceipt.js`
      - `server/models/Complaint.js`
      - `server/models/ComplaintUpdate.js`
      - `server/models/Category.js`
      - `server/models/Document.js`
      - `server/models/Notification.js`
      - `server/models/Notice.js`
      - `server/models/Feedback.js`
      - `server/models/Enquiry.js`
      - `server/models/Counter.js`

      Verify (models load without errors):
      ```bash
      cd "/Users/harshpanchal/Desktop/WAD Project/PG/server" && \
        node -e "
          require('dotenv').config();
          require('./models/User');
          require('./models/PG');
          require('./models/Room');
          require('./models/Bed');
          require('./models/Resident');
          require('./models/Staff');
          require('./models/Payment');
          require('./models/PaymentReceipt');
          require('./models/Complaint');
          require('./models/ComplaintUpdate');
          require('./models/Category');
          require('./models/Document');
          require('./models/Notification');
          require('./models/Notice');
          require('./models/Feedback');
          require('./models/Enquiry');
          require('./models/Counter');
          console.log('All 17 models loaded OK');
        "
      ```
      Expected output: `All 17 models loaded OK` with no thrown errors.

---

- [ ] 5. **Update `server/config/db.js`**

      Change the default fallback DB name from `local-marketplace` to `pg-management` so that
      running without a `.env` file doesn't write PG data into the old marketplace database.

      File: `server/config/db.js`

      Change:
      ```js
      // Before
      mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/local-marketplace')
      // After
      mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pg-management')
      ```

      Verify: File diff — confirm the old string is gone.

---

- [ ] 6. **Update `.env.example`**

      Replace the marketplace-focused example with all keys required by the PG system.
      Do NOT modify the actual `.env` file — only `.env.example`.

      File: `server/.env.example`

      New content:
      ```dotenv
      # Server
      PORT=5000
      NODE_ENV=development

      # MongoDB
      MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/pg-management

      # JWT
      JWT_SECRET=replace_with_long_random_string
      JWT_REFRESH_SECRET=replace_with_different_long_random_string

      # Cloudinary
      CLOUDINARY_CLOUD_NAME=your_cloud_name
      CLOUDINARY_API_KEY=your_api_key
      CLOUDINARY_API_SECRET=your_api_secret

      # Payment (razorpay | stripe)
      PAYMENT_PROVIDER=razorpay
      RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
      RAZORPAY_KEY_SECRET=your_razorpay_secret

      # Cron timezone (e.g. Asia/Kolkata)
      NODE_CRON_TIMEZONE=Asia/Kolkata
      ```

      Verify: `cat server/.env.example` — confirm all keys present.

---

- [ ] 7. **Rewrite `server/server.js`**

      Remove all marketplace route mounts and the `getCategories` inline endpoint.
      Add `helmet`, `morgan`, and a PG-system health response.
      Keep the port-finding logic and global error handler (they are good and reusable).
      No PG API routes are mounted yet — Phase 3 will add `/api/auth`; subsequent phases add the rest.

      File: `server/server.js`

      New content:
      ```js
      const express = require('express');
      const cors    = require('cors');
      const helmet  = require('helmet');
      const morgan  = require('morgan');
      const dotenv  = require('dotenv');
      const net     = require('net');
      const connectDB = require('./config/db');

      dotenv.config();
      connectDB();

      const app = express();

      // Security & logging
      app.use(helmet());
      app.use(cors());
      app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

      // Body parsers
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));

      // ─── Routes will be mounted here as phases complete ───────────────────────
      // Phase 3+:  app.use('/api/auth',      require('./routes/authRoutes'));
      // Phase 4+:  app.use('/api/rooms',     require('./routes/roomRoutes'));
      // Phase 4+:  app.use('/api/public',    require('./routes/publicRoutes'));
      // Phase 5+:  app.use('/api/residents', require('./routes/residentRoutes'));
      // Phase 6+:  app.use('/api/payments',  require('./routes/paymentRoutes'));
      // Phase 8+:  app.use('/api/complaints',require('./routes/complaintRoutes'));
      // ──────────────────────────────────────────────────────────────────────────

      // Health check
      app.get('/api/health', (req, res) => {
        res.status(200).json({
          success: true,
          message: 'PG Management API is running',
          timestamp: new Date()
        });
      });

      // Global error handler
      app.use((err, req, res, next) => {
        console.error('Unhandled error:', err);
        const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
        res.status(statusCode).json({
          success: false,
          message: err.message || 'Internal Server Error',
          stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
        });
      });

      const PORT = Number(process.env.PORT || 5000);

      const getAvailablePort = (preferred) =>
        new Promise((resolve, reject) => {
          const tester = net.createServer();
          tester.once('error', (err) => {
            if (err.code === 'EADDRINUSE') return resolve(getAvailablePort(preferred + 1));
            reject(err);
          });
          tester.once('listening', () => {
            const addr = tester.address();
            const port = typeof addr === 'object' && addr ? addr.port : preferred;
            tester.close(() => resolve(port));
          });
          tester.listen(preferred);
        });

      getAvailablePort(PORT)
        .then((port) => {
          app.listen(port, '0.0.0.0', () =>
            console.log(`PG Management server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`)
          );
        })
        .catch((err) => {
          console.error('Failed to start server:', err);
          process.exit(1);
        });
      ```

      Verify:
      ```bash
      cd "/Users/harshpanchal/Desktop/WAD Project/PG/server" && node server.js &
      sleep 2 && curl -s http://localhost:5000/api/health | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); const j=JSON.parse(d); process.exit(j.success ? 0 : 1);"
      ```
      Expected: exit code 0, JSON response with `"success": true`.
      Kill the background server after: `kill %1` or `pkill -f "node server.js"`.

---

- [ ] 8. **Update `server/package.json`**

      Change `"name"` from `"multi-vendor-marketplace-server"` to `"pg-management-server"`.
      Update `"description"`. Add a `"seed"` script pointing to the new seeder (already present).

      File: `server/package.json`

      Changes:
      - `"name"`: `"pg-management-server"`
      - `"description"`: `"Backend for PG Management & Resident Service Management System"`
      - `"scripts"."seed"`: stays `"node utils/seeder.js"` (already correct)
      - `"scripts"."test"`: change to `"node utils/seeder.js --smoke"` for now (old test-suite.js is replaced in step 9)

      Verify: `node -e "const p = require('./package.json'); console.log(p.name)"` → prints `pg-management-server`.

---

- [ ] 9. **Replace `server/utils/seeder.js` with the PG seed script**

      The new seeder creates exactly the data described in the master spec Phase 2 requirement:
      1 admin user + 1 PG + floors/rooms/beds + default service categories + sample staff + sample residents.

      File: `server/utils/seeder.js`

      The script must:

      a. **Connect to MongoDB** using `MONGO_URI` from `.env` (same pattern as the old seeder).

      b. **Drop / clear all PG collections** in this order (respects ref integrity for clarity):
         `Counter`, `Notification`, `Notice`, `Feedback`, `Enquiry`,
         `ComplaintUpdate`, `Complaint`, `Document`, `PaymentReceipt`, `Payment`,
         `Staff`, `Resident`, `Bed`, `Room`, `Category`, `PG`, `User`.

      c. **Create admin user** (role: ADMIN):
         ```
         name: "PG Admin", email: "admin@pgmanage.com",
         phone: "+91 9800000001", passwordHash: bcrypt(10 rounds) of "Admin@1234"
         pgId: null (set after PG is created), isActive: true
         ```

      d. **Create PG**:
         ```
         name: "Sunrise PG", ownerId: admin._id,
         address: "12 MG Road, Bengaluru, Karnataka 560001",
         contact: "+91 8000000001",
         amenities: ["Wi-Fi", "Power Backup", "CCTV", "Hot Water", "Laundry", "Parking"],
         photos: []
         ```

      e. **Patch admin user** to set `pgId` = pg._id after PG is created.

      f. **Create Rooms** — 2 floors (1 and 2), 3 rooms per floor (6 rooms total):
         ```
         Floor 1: 101 (Single, cap 1, rent 8000), 102 (Double, cap 2, rent 6500/bed),
                  103 (Triple, cap 3, rent 5500/bed)
         Floor 2: 201 (Single, cap 1, rent 8500), 202 (Double, cap 2, rent 7000/bed),
                  203 (Triple, cap 3, rent 6000/bed)
         ```
         All rooms: `pgId = pg._id`.

      g. **Create Beds** — one bed per capacity slot, labelled "A", "B", "C":
         - Room 101: Bed A (AVAILABLE)
         - Room 102: Bed A, Bed B (both AVAILABLE)
         - Room 103: Bed A, Bed B, Bed C (all AVAILABLE — 1 will be OCCUPIED by resident below)
         - Room 201: Bed A (AVAILABLE)
         - Room 202: Bed A, Bed B (both AVAILABLE)
         - Room 203: Bed A, Bed B, Bed C (all AVAILABLE — 1 will be OCCUPIED by resident below)

      h. **Create default service Categories** (scoped to `pgId`):
         Electrical, Plumbing, Cleaning, Furniture, Wi-Fi, AC, Fan, Water,
         Room Maintenance, Bathroom, Security, Other (12 categories).

      i. **Create 2 staff users** (role: STAFF):
         ```
         Staff 1: name "Ravi Kumar",  email "ravi@sunrise.pg",  phone "+91 9100000001"
                  passwordHash: bcrypt("Staff@1234"), pgId: pg._id
                  Staff doc: category: ["Electrical","Plumbing"], isActive: true
         Staff 2: name "Suresh Nair", email "suresh@sunrise.pg", phone "+91 9100000002"
                  passwordHash: bcrypt("Staff@1234"), pgId: pg._id
                  Staff doc: category: ["Cleaning","Furniture","Wi-Fi"], isActive: true
         ```

      j. **Create 2 resident users** (role: RESIDENT):
         ```
         Resident 1: name "Priya Sharma", email "priya@resident.com", phone "+91 9200000001"
                     passwordHash: bcrypt("Resident@1234"), pgId: pg._id
                     Resident doc: gender "Female", joiningDate: 2025-01-01,
                       roomId: room103._id, bedId: bedC_103._id,
                       monthlyRent: 5500, securityDeposit: 11000, status: ACTIVE
                     Mark bedC_103 status: OCCUPIED, residentId: resident1._id (atomically)

         Resident 2: name "Arjun Mehta", email "arjun@resident.com",  phone "+91 9200000002"
                     passwordHash: bcrypt("Resident@1234"), pgId: pg._id
                     Resident doc: gender "Male", joiningDate: 2025-02-01,
                       roomId: room203._id, bedId: bedC_203._id,
                       monthlyRent: 6000, securityDeposit: 12000, status: ACTIVE
                     Mark bedC_203 status: OCCUPIED, residentId: resident2._id
         ```
         Use a Mongoose session/transaction for each bed assignment (bed update + resident doc
         creation together) to validate the transactional pattern from the spec.

      k. **Print seeded credentials** at the end:
         ```
         Admin:       admin@pgmanage.com    / Admin@1234
         Staff 1:     ravi@sunrise.pg       / Staff@1234
         Staff 2:     suresh@sunrise.pg     / Staff@1234
         Resident 1:  priya@resident.com    / Resident@1234
         Resident 2:  arjun@resident.com    / Resident@1234
         ```

      The seeder must handle `--smoke` flag: when invoked as `node utils/seeder.js --smoke`,
      it seeds then exits 0 on success (used by the updated `"test"` npm script as a smoke test).
      When invoked without the flag, it seeds and exits 0 as before.

      Verify:
      ```bash
      cd "/Users/harshpanchal/Desktop/WAD Project/PG/server" && npm run seed
      ```
      Expected: all console logs print, no errors, credentials table appears at the end.
      Exit code: 0.

---

- [ ] 10. **Replace `server/test-suite.js`** with a PG smoke test

       The old test-suite tested marketplace routes that no longer exist. Replace it with a minimal
       test that verifies the server starts, the health endpoint responds, and all 17 models
       can be required and connect to the in-memory DB.

       File: `server/test-suite.js`

       The replacement test must:
       - Spin up `MongoMemoryServer` (already a dev dependency).
       - Connect Mongoose to the in-memory URI.
       - Require all 17 model files without errors.
       - Call `GET /api/health` via `supertest` and assert `{ success: true }`.
       - Disconnect + stop the in-memory server.
       - Print `ALL SMOKE TESTS PASSED` on success.
       - Exit 1 on any failure.

       Verify:
       ```bash
       cd "/Users/harshpanchal/Desktop/WAD Project/PG/server" && node test-suite.js
       ```
       Expected: `ALL SMOKE TESTS PASSED`, exit code 0.

---

- [ ] 11. **Update `server/middleware/authMiddleware.js`**

       The middleware imports `User` from `../models/User`. The new User model stores the password
       as `passwordHash` (not `password`) but `select('-password')` will no longer suppress
       anything — update the select call to `select('-passwordHash')` so the hash is never sent
       to route handlers.

       File: `server/middleware/authMiddleware.js`

       Change only the one line: `.select('-password')` → `.select('-passwordHash')`.
       No other changes (Phase 3 will fully rewrite this middleware for refresh tokens).

       Verify: `node -e "require('./middleware/authMiddleware')"` — no thrown errors.

---

## Post-Phase Verification

Run all three checks in sequence; all must pass:

```bash
cd "/Users/harshpanchal/Desktop/WAD Project/PG/server"

# 1. Smoke tests (models + health endpoint)
node test-suite.js

# 2. Full seed into Atlas (requires .env with real MONGO_URI)
npm run seed

# 3. Server starts and health responds
npm run dev &
sleep 3
curl -s http://localhost:5000/api/health
kill %1
```

Expected outcomes:
- `node test-suite.js` → prints `ALL SMOKE TESTS PASSED`
- `npm run seed` → prints credentials table, exit 0
- `curl` → `{"success":true,"message":"PG Management API is running","timestamp":"..."}`

---

## Files Summary

### Delete
| File | Reason |
|------|--------|
| `server/models/Cart.js` | Marketplace model |
| `server/models/Category.js` | Marketplace model (replaced by PG-scoped Category) |
| `server/models/Order.js` | Marketplace model |
| `server/models/Product.js` | Marketplace model |
| `server/models/Shop.js` | Marketplace model |
| `server/models/User.js` | Marketplace User (roles buyer/seller/admin); replaced by PG User |
| `server/controllers/adminController.js` | References Shop, Order, old Category |
| `server/controllers/authController.js` | References old User |
| `server/controllers/cartController.js` | References Cart, Product |
| `server/controllers/orderController.js` | References Order, Cart, Product, Shop |
| `server/controllers/productController.js` | References Product, Shop |
| `server/controllers/shopController.js` | References Shop |
| `server/routes/adminRoutes.js` | Imports deleted controller |
| `server/routes/authRoutes.js` | Imports deleted controller |
| `server/routes/cartRoutes.js` | Imports deleted controller |
| `server/routes/orderRoutes.js` | Imports deleted controller |
| `server/routes/productRoutes.js` | Imports deleted controller |
| `server/routes/shopRoutes.js` | Imports deleted controller |

### Create
| File | Contents |
|------|----------|
| `server/models/User.js` | PG User (roles ADMIN/RESIDENT/STAFF) |
| `server/models/PG.js` | PG properties |
| `server/models/Room.js` | Room (pgId + unique roomNumber per PG) |
| `server/models/Bed.js` | Bed (AVAILABLE/OCCUPIED) |
| `server/models/Resident.js` | Resident profile |
| `server/models/Staff.js` | Staff profile |
| `server/models/Payment.js` | Rent payment (unique residentId+month) |
| `server/models/PaymentReceipt.js` | Immutable receipt snapshot |
| `server/models/Complaint.js` | Service request with requestNo |
| `server/models/ComplaintUpdate.js` | Timeline entries |
| `server/models/Category.js` | PG-scoped service categories |
| `server/models/Document.js` | KYC/uploaded docs |
| `server/models/Notification.js` | In-app notifications |
| `server/models/Notice.js` | Admin-broadcast notices |
| `server/models/Feedback.js` | Post-resolution feedback |
| `server/models/Enquiry.js` | Public visitor enquiries |
| `server/models/Counter.js` | Atomic sequence generator |

### Modify
| File | Change |
|------|--------|
| `server/server.js` | Remove marketplace routes; add helmet/morgan; PG health message |
| `server/package.json` | Rename, re-describe; test script updated |
| `server/.env.example` | Add JWT_REFRESH_SECRET, PAYMENT_PROVIDER, Razorpay keys, timezone |
| `server/config/db.js` | Default DB name `local-marketplace` → `pg-management` |
| `server/utils/seeder.js` | Full replacement with PG seed data |
| `server/test-suite.js` | Full replacement with PG smoke tests |
| `server/middleware/authMiddleware.js` | `.select('-password')` → `.select('-passwordHash')` |

### Keep untouched
- `server/config/cloudinary.js` — already correct
- `server/middleware/uploadMiddleware.js` — already correct
- `server/middleware/roleMiddleware.js` — will be rewritten in Phase 3
- `server/utils/generateToken.js` — will be rewritten in Phase 3
- `server/.env` — never modify; developer fills in real values

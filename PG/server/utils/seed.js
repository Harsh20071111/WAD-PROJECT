require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const PG = require('../models/PG');
const Room = require('../models/Room');
const Bed = require('../models/Bed');
const Resident = require('../models/Resident');
const Staff = require('../models/Staff');
const Payment = require('../models/Payment');
const Category = require('../models/Category');
const Notice = require('../models/Notice');
const Enquiry = require('../models/Enquiry');
const Counter = require('../models/Counter');

// Seed data
const DEFAULT_CATEGORIES = [
  'Electrical', 'Plumbing', 'Cleaning', 'Furniture', 'Wi-Fi',
  'AC', 'Fan', 'Water', 'Room Maintenance', 'Bathroom',
  'Security', 'Carpentry', 'Pest Control', 'Common Area', 'Other'
];

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  console.log('🗑️  Clearing database...');
  const collections = [
    Counter, Notice, Enquiry, Payment, Staff, Resident, Bed, Room, Category, PG, User
  ];
  for (const model of collections) {
    await model.deleteMany({});
  }
  console.log('✅ Database cleared');
};

const seedDatabase = async () => {
  console.log('🌱 Starting seed process...\n');

  // 1. Create Admin User
  const admin = await User.create({
    name: 'PG Admin',
    email: 'admin@pgmanage.com',
    phone: '+91 9800000001',
    passwordHash: 'Admin@1234',
    role: 'ADMIN',
    isActive: true
  });
  console.log('✅ Admin user created');

  // 2. Create PG
  const pg = await PG.create({
    name: 'Sunrise PG',
    address: {
      street: '12 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001'
    },
    contact: {
      phone: '+91 8000000001',
      email: 'admin@pgmanage.com'
    },
    amenities: ['Wi-Fi', 'Power Backup', 'CCTV', 'Hot Water', 'Laundry', 'Parking'],
    photos: [],
    ownerId: admin._id
  });
  console.log('✅ PG created');

  // 3. Update Admin with pgId
  admin.pgId = pg._id;
  await admin.save();
  console.log('✅ Admin linked to PG');

  // 4. Create Rooms
  const rooms = [];
  const roomConfigs = [
    { floor: 1, roomNumber: '101', type: 'SINGLE', capacity: 1, rent: 8000 },
    { floor: 1, roomNumber: '102', type: 'DOUBLE', capacity: 2, rent: 6500 },
    { floor: 1, roomNumber: '103', type: 'TRIPLE', capacity: 3, rent: 5500 },
    { floor: 2, roomNumber: '201', type: 'SINGLE', capacity: 1, rent: 8500 },
    { floor: 2, roomNumber: '202', type: 'DOUBLE', capacity: 2, rent: 7000 },
    { floor: 2, roomNumber: '203', type: 'TRIPLE', capacity: 3, rent: 6000 }
  ];

  for (const config of roomConfigs) {
    const room = await Room.create({
      pgId: pg._id,
      ...config,
      amenities: ['Wi-Fi', 'Attached Bathroom'],
      isActive: true
    });
    rooms.push(room);
  }
  console.log('✅ Rooms created (6 rooms across 2 floors)');

  // 5. Create Beds
  const beds = [];
  const bedLabels = ['A', 'B', 'C', 'D'];

  for (const room of rooms) {
    for (let i = 0; i < room.capacity; i++) {
      const bed = await Bed.create({
        pgId: pg._id,
        roomId: room._id,
        label: bedLabels[i],
        status: 'AVAILABLE',
        residentId: null
      });
      beds.push(bed);
    }
  }
  console.log('✅ Beds created (13 beds total)');

  // 6. Create Default Categories
  for (const catName of DEFAULT_CATEGORIES) {
    await Category.create({
      pgId: pg._id,
      name: catName,
      isDefault: true
    });
  }
  console.log('✅ Default categories created (15 categories)');

  // 7. Create Staff Users + Staff Docs
  const staff1User = await User.create({
    name: 'Ravi Kumar',
    email: 'ravi@sunrise.pg',
    phone: '+91 9100000001',
    passwordHash: 'Staff@1234',
    role: 'STAFF',
    pgId: pg._id,
    isActive: true
  });
  
  await Staff.create({
    userId: staff1User._id,
    pgId: pg._id,
    categories: ['Electrical', 'Plumbing', 'AC'],
    isActive: true
  });

  const staff2User = await User.create({
    name: 'Suresh Nair',
    email: 'suresh@sunrise.pg',
    phone: '+91 9100000002',
    passwordHash: 'Staff@1234',
    role: 'STAFF',
    pgId: pg._id,
    isActive: true
  });
  
  await Staff.create({
    userId: staff2User._id,
    pgId: pg._id,
    categories: ['Cleaning', 'Furniture', 'Wi-Fi'],
    isActive: true
  });
  console.log('✅ Staff created (2 staff members)');

  // 8. Create Resident Users + Resident Docs with bed assignment
  // Resident 1 - Room 103, Bed C
  const resident1User = await User.create({
    name: 'Priya Sharma',
    email: 'priya@resident.com',
    phone: '+91 9200000001',
    passwordHash: 'Resident@1234',
    role: 'RESIDENT',
    pgId: pg._id,
    isActive: true
  });

  const room103 = rooms.find(r => r.roomNumber === '103');
  const bedC103 = beds.find(b => b.roomId.toString() === room103._id.toString() && b.label === 'C');

  const resident1 = await Resident.create({
    userId: resident1User._id,
    pgId: pg._id,
    gender: 'FEMALE',
    dob: new Date('1995-05-15'),
    address: '45 Park Street, Delhi',
    emergencyContact: {
      name: 'Raj Sharma',
      phone: '+91 9300000001',
      relation: 'Father'
    },
    joiningDate: new Date('2025-01-01'),
    roomId: room103._id,
    bedId: bedC103._id,
    monthlyRent: 5500,
    securityDeposit: 11000,
    status: 'ACTIVE'
  });

  // Mark bed as occupied
  bedC103.status = 'OCCUPIED';
  bedC103.residentId = resident1._id;
  await bedC103.save();

  // Resident 2 - Room 203, Bed C
  const resident2User = await User.create({
    name: 'Arjun Mehta',
    email: 'arjun@resident.com',
    phone: '+91 9200000002',
    passwordHash: 'Resident@1234',
    role: 'RESIDENT',
    pgId: pg._id,
    isActive: true
  });

  const room203 = rooms.find(r => r.roomNumber === '203');
  const bedC203 = beds.find(b => b.roomId.toString() === room203._id.toString() && b.label === 'C');

  const resident2 = await Resident.create({
    userId: resident2User._id,
    pgId: pg._id,
    gender: 'MALE',
    dob: new Date('1998-08-20'),
    address: '78 Lake View, Mumbai',
    emergencyContact: {
      name: 'Sunita Mehta',
      phone: '+91 9300000002',
      relation: 'Mother'
    },
    joiningDate: new Date('2025-02-01'),
    roomId: room203._id,
    bedId: bedC203._id,
    monthlyRent: 6000,
    securityDeposit: 12000,
    status: 'ACTIVE'
  });

  // Mark bed as occupied
  bedC203.status = 'OCCUPIED';
  bedC203.residentId = resident2._id;
  await bedC203.save();

  console.log('✅ Residents created (2 residents with bed assignments)');

  // 9. Create Sample Payments
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonth = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0') || (now.getMonth() === 0 ? `${now.getFullYear() - 1}-12` : String(now.getMonth()).padStart(2, '0'))}`;

  // Payments for Resident 1
  await Payment.create({
    pgId: pg._id,
    residentId: resident1._id,
    month: lastMonth,
    amount: 5500,
    paidAmount: 5500,
    dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 5),
    status: 'PAID',
    method: 'UPI',
    paidAt: new Date(now.getFullYear(), now.getMonth() - 1, 3)
  });

  await Payment.create({
    pgId: pg._id,
    residentId: resident1._id,
    month: currentMonth,
    amount: 5500,
    paidAmount: 0,
    dueDate: new Date(now.getFullYear(), now.getMonth(), 5),
    status: 'PENDING'
  });

  // Payments for Resident 2
  await Payment.create({
    pgId: pg._id,
    residentId: resident2._id,
    month: lastMonth,
    amount: 6000,
    paidAmount: 6000,
    dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 5),
    status: 'PAID',
    method: 'CARD',
    paidAt: new Date(now.getFullYear(), now.getMonth() - 1, 4)
  });

  await Payment.create({
    pgId: pg._id,
    residentId: resident2._id,
    month: currentMonth,
    amount: 6000,
    paidAmount: 0,
    dueDate: new Date(now.getFullYear(), now.getMonth(), 5),
    status: 'PENDING'
  });

  console.log('✅ Payments created (4 payment records)');

  // 10. Create Sample Notices
  await Notice.create({
    pgId: pg._id,
    title: 'Water Supply Maintenance',
    body: 'Water supply will be unavailable on Sunday, 10 AM to 2 PM due to maintenance work. Please store sufficient water.',
    createdBy: admin._id,
    isActive: true
  });

  await Notice.create({
    pgId: pg._id,
    title: 'Monthly Rent Reminder',
    body: 'Kindly pay your monthly rent before the 5th of every month to avoid late fees. Contact admin for any queries.',
    createdBy: admin._id,
    isActive: true
  });

  console.log('✅ Notices created (2 notices)');

  // 11. Create Sample Enquiries
  await Enquiry.create({
    pgId: pg._id,
    name: 'Vikram Singh',
    phone: '+91 9400000001',
    email: 'vikram@email.com',
    moveInDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    message: 'Looking for a single room with attached bathroom. Need WiFi and parking facility.',
    status: 'NEW'
  });

  await Enquiry.create({
    pgId: pg._id,
    name: 'Neha Gupta',
    phone: '+91 9400000002',
    email: 'neha@email.com',
    moveInDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
    message: 'Interested in triple sharing room. Need details about meals and laundry service.',
    status: 'NEW'
  });

  console.log('✅ Enquiries created (2 enquiries)');

  // Print credentials
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log('\n📋 Login Credentials:\n');
  console.log('Admin:       admin@pgmanage.com    / Admin@1234');
  console.log('Staff 1:     ravi@sunrise.pg       / Staff@1234');
  console.log('Staff 2:     suresh@sunrise.pg     / Staff@1234');
  console.log('Resident 1:  priya@resident.com    / Resident@1234');
  console.log('Resident 2:  arjun@resident.com    / Resident@1234');
  console.log('\n' + '='.repeat(60));
};

// Main execution
const run = async () => {
  await connectDB();
  await clearDatabase();
  await seedDatabase();
  await mongoose.connection.close();
  console.log('\n📊 Database connection closed');
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});

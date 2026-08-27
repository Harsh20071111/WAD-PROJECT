# Multi-Vendor Local Marketplace

Full-stack hyper-local multi-vendor marketplace platform built with **React (JavaScript, Vite) + Node.js/Express + MongoDB (Mongoose)**.

## Core Rule & Architecture
- **Strict Vendor Isolation**: A product belongs to exactly one shop. Every query returning products is filtered by `shopId`. On write operations, `shopId` is never trusted from the client payload and is strictly derived from the authenticated seller's own registered shop.
- **Cart & Order Splitting**: A buyer can add products from multiple local shops into a single cart. During checkout, the backend automatically splits and creates separate, distinct `Order` documents for each participating vendor shop.

---

## Project Structure

```text
multi-vendor-marketplace/
├── client/                      # React (Vite + Tailwind CSS + Lucide Icons)
│   ├── src/
│   │   ├── components/          # Navbar, ShopCard, ProductCard, CartItem, OrderStatusBadge, ProtectedRoute
│   │   ├── context/             # AuthContext, CartContext
│   │   ├── pages/
│   │   │   ├── buyer/           # ShopList, ShopPage, Cart, Checkout, Orders
│   │   │   ├── seller/          # Dashboard, ShopSettings, AddProduct, MyProducts, MyOrders
│   │   │   ├── admin/           # ApproveShops, ManageCategories, AllOrders
│   │   │   └── auth/            # Login, Register
│   │   ├── services/            # api, auth, shop, product, cart, order, admin
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── server/                      # Node.js + Express + Mongoose
    ├── config/                  # db.js, cloudinary.js
    ├── controllers/             # authController, shopController, productController, cartController, orderController, adminController
    ├── middleware/              # authMiddleware, roleMiddleware, uploadMiddleware
    ├── models/                  # User, Shop, Product, Cart, Order, Category
    ├── routes/                  # authRoutes, shopRoutes, productRoutes, cartRoutes, orderRoutes, adminRoutes
    ├── utils/                   # generateToken.js, seeder.js
    ├── server.js
    ├── test-suite.js            # Automated integration tests
    └── package.json
```

---

## Quick Start

### 1. Server Setup
```bash
cd server
npm install
npm run test     # Runs the in-memory test suite verifying all routes & rules
npm run seed     # (Optional) Seeds demo users, shops, and products into MongoDB
npm run dev      # Starts server on http://localhost:5000
```

### 2. Client Setup
```bash
cd client
npm install
npm run dev      # Starts React Vite client on http://localhost:3000
```

---

## Demo Accounts (when seeded)
- **Buyer**: `charlie@buyer.com` / `password123`
- **Seller 1 (Bakery)**: `alice@bakery.com` / `password123`
- **Seller 2 (Orchard Farm)**: `bob@farmfresh.com` / `password123`
- **Admin**: `admin@localmart.com` / `password123`

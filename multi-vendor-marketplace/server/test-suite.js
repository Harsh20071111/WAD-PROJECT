const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const request = require('supertest');
const assert = require('assert');

// Create test app
const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/shops', require('./routes/shopRoutes'));
  app.use('/api/products', require('./routes/productRoutes'));
  app.use('/api/cart', require('./routes/cartRoutes'));
  app.use('/api/orders', require('./routes/orderRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));

  const { getCategories } = require('./controllers/adminController');
  app.get('/api/categories', getCategories);

  return app;
};

const runAllTests = async () => {
  console.log('==================================================');
  console.log(' STARTING MULTI-VENDOR MARKETPLACE INTEGRATION TEST ');
  console.log('==================================================\n');

  // 1. Start In-Memory MongoDB
  console.log('1. Initializing MongoMemoryServer...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log('   Connected to In-Memory DB:', uri);

  const app = createApp();

  try {
    // 2. Auth Tests (Register & Login for Buyer, 2 Sellers, Admin)
    console.log('\n2. Testing Authentication & Role Registration...');
    
    // Register Buyer
    const buyerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Buyer Bob',
        email: 'buyer@test.com',
        password: 'password123',
        role: 'buyer',
        address: '123 Elm Street'
      });
    assert.strictEqual(buyerRes.status, 201, 'Buyer registration failed');
    assert.ok(buyerRes.body.token, 'Token missing for buyer');
    const buyerToken = buyerRes.body.token;
    console.log('   ✓ Buyer registered successfully');

    // Register Seller 1
    const seller1Res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alice Baker',
        email: 'alice@test.com',
        password: 'password123',
        role: 'seller'
      });
    assert.strictEqual(seller1Res.status, 201, 'Seller 1 registration failed');
    const seller1Token = seller1Res.body.token;
    console.log('   ✓ Seller 1 registered successfully');

    // Register Seller 2
    const seller2Res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Charlie Farmer',
        email: 'charlie@test.com',
        password: 'password123',
        role: 'seller'
      });
    assert.strictEqual(seller2Res.status, 201, 'Seller 2 registration failed');
    const seller2Token = seller2Res.body.token;
    console.log('   ✓ Seller 2 registered successfully');

    // Register Admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin Boss',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      });
    assert.strictEqual(adminRes.status, 201, 'Admin registration failed');
    const adminToken = adminRes.body.token;
    console.log('   ✓ Admin registered successfully');

    // 3. Shop Creation & Admin Approval
    console.log('\n3. Testing Shop Creation & Admin Approvals...');
    
    // Seller 1 creates Bakery Shop
    const shop1Res = await request(app)
      .post('/api/shops')
      .set('Authorization', `Bearer ${seller1Token}`)
      .send({
        shopName: 'Artisan Bakery',
        description: 'Fresh organic sourdough breads and pastries',
        address: '10 Bakery Lane'
      });
    assert.strictEqual(shop1Res.status, 201, 'Shop 1 creation failed');
    assert.strictEqual(shop1Res.body.shop.isApproved, false, 'New shop must default to isApproved=false');
    const shop1Id = shop1Res.body.shop._id;
    console.log('   ✓ Seller 1 created shop (pending approval)');

    // Seller 2 creates Organic Farm Shop
    const shop2Res = await request(app)
      .post('/api/shops')
      .set('Authorization', `Bearer ${seller2Token}`)
      .send({
        shopName: 'Valley Fresh Farm',
        description: 'Fresh local farm fruits and vegetables',
        address: '20 Orchard Road'
      });
    assert.strictEqual(shop2Res.status, 201, 'Shop 2 creation failed');
    assert.strictEqual(shop2Res.body.shop.isApproved, false, 'New shop must default to isApproved=false');
    const shop2Id = shop2Res.body.shop._id;
    console.log('   ✓ Seller 2 created shop (pending approval)');

    // Admin lists pending shops
    const pendingRes = await request(app)
      .get('/api/admin/shops/pending')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.strictEqual(pendingRes.status, 200);
    assert.strictEqual(pendingRes.body.shops.length, 2, 'Admin should see 2 pending shops');
    console.log('   ✓ Admin retrieved 2 pending shops');

    // Admin approves Shop 1 and Shop 2
    const approve1 = await request(app)
      .put(`/api/admin/shops/${shop1Id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.strictEqual(approve1.status, 200);
    assert.strictEqual(approve1.body.shop.isApproved, true);

    const approve2 = await request(app)
      .put(`/api/admin/shops/${shop2Id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.strictEqual(approve2.status, 200);
    assert.strictEqual(approve2.body.shop.isApproved, true);
    console.log('   ✓ Admin approved both shops');

    // Public list approved shops
    const publicShops = await request(app).get('/api/shops');
    assert.strictEqual(publicShops.status, 200);
    assert.strictEqual(publicShops.body.shops.length, 2);
    console.log('   ✓ Public /api/shops returns approved shops');

    // 4. Products & Shop Isolation Boundary Testing
    console.log('\n4. Testing Product Isolation & Shop Binding...');

    // Seller 1 adds Product 1A (Sourdough) & Product 1B (Croissant)
    // Note: Attempt to inject a spoofed shopId in body - the controller MUST ignore it and derive from Seller 1's shop!
    const prod1ARes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${seller1Token}`)
      .send({
        name: 'Sourdough Loaf',
        brand: 'Artisan',
        price: 8.00,
        stock: 20,
        category: 'Artisan Bakery',
        shopId: shop2Id // Malicious attempt to spoof shopId!
      });
    assert.strictEqual(prod1ARes.status, 201);
    assert.strictEqual(prod1ARes.body.product.shopId.toString(), shop1Id.toString(), 'Core Rule: shopId MUST be derived from logged-in seller, not from body');
    const prod1AId = prod1ARes.body.product._id;
    console.log('   ✓ Product 1A created with strictly derived shopId (spoofed shopId ignored)');

    const prod1BRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${seller1Token}`)
      .send({
        name: 'Butter Croissant',
        price: 4.50,
        stock: 15,
        category: 'Artisan Bakery'
      });
    assert.strictEqual(prod1BRes.status, 201);

    // Seller 2 adds Product 2A (Apples) & Product 2B (Honey)
    const prod2ARes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${seller2Token}`)
      .send({
        name: 'Orchard Honeycrisp Apples',
        price: 6.00,
        stock: 30,
        category: 'Fresh Produce'
      });
    assert.strictEqual(prod2ARes.status, 201);
    assert.strictEqual(prod2ARes.body.product.shopId.toString(), shop2Id.toString());
    const prod2AId = prod2ARes.body.product._id;

    const prod2BRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${seller2Token}`)
      .send({
        name: 'Raw Honey 500g',
        price: 12.00,
        stock: 10,
        category: 'Fresh Produce'
      });
    assert.strictEqual(prod2BRes.status, 201);
    console.log('   ✓ Products created for both shops');

    // TEST ISOLATION BOUNDARY: GET /api/shops/:shopId/products
    const shop1Prods = await request(app).get(`/api/shops/${shop1Id}/products`);
    assert.strictEqual(shop1Prods.status, 200);
    assert.strictEqual(shop1Prods.body.products.length, 2, 'Shop 1 must return exactly its 2 products');
    assert.ok(shop1Prods.body.products.every(p => p.shopId.toString() === shop1Id.toString()), 'All products must belong to Shop 1');
    console.log('   ✓ Verified Isolation Boundary: GET /api/shops/:shop1Id/products only returns Shop 1 products');

    const shop2Prods = await request(app).get(`/api/shops/${shop2Id}/products`);
    assert.strictEqual(shop2Prods.status, 200);
    assert.strictEqual(shop2Prods.body.products.length, 2, 'Shop 2 must return exactly its 2 products');
    assert.ok(shop2Prods.body.products.every(p => p.shopId.toString() === shop2Id.toString()), 'All products must belong to Shop 2');
    console.log('   ✓ Verified Isolation Boundary: GET /api/shops/:shop2Id/products only returns Shop 2 products');

    // Unauthorized edit test: Seller 1 cannot modify Product 2A (owned by Shop 2)
    const unauthorizedEdit = await request(app)
      .put(`/api/products/${prod2AId}`)
      .set('Authorization', `Bearer ${seller1Token}`)
      .send({ name: 'Hacked name', price: 1.00 });
    assert.strictEqual(unauthorizedEdit.status, 404, 'Seller 1 must NOT be allowed to edit Seller 2 product');
    console.log('   ✓ Cross-seller product modification correctly rejected');

    // 5. Cart and Multi-Vendor Checkout
    console.log('\n5. Testing Cart and Multi-Vendor Checkout Split...');

    // Buyer adds Product 1A (Shop 1, 2 units) and Product 2A (Shop 2, 3 units) to cart
    const add1 = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ productId: prod1AId, quantity: 2 });
    assert.strictEqual(add1.status, 200);

    const add2 = await request(app)
      .post('/api/cart')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ productId: prod2AId, quantity: 3 });
    assert.strictEqual(add2.status, 200);
    assert.strictEqual(add2.body.cart.items.length, 2, 'Cart should contain 2 items across 2 shops');
    console.log('   ✓ Buyer added items from 2 different shops to cart');

    // Buyer places order (One checkout -> multiple vendor orders)
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ deliveryAddress: '123 Elm Street, Suite 4B' });
    
    assert.strictEqual(orderRes.status, 201, 'Place order failed');
    assert.strictEqual(orderRes.body.orders.length, 2, 'CORE REQUIREMENT: One checkout with items from 2 shops MUST produce 2 separate Order documents!');
    
    const [orderShop1, orderShop2] = orderRes.body.orders;
    console.log('   ✓ 2 distinct Order documents created from single checkout!');

    // Verify stock deducted
    const updatedProd1A = await request(app).get(`/api/products/${prod1AId}`);
    assert.strictEqual(updatedProd1A.body.product.stock, 18, 'Stock should be deducted from 20 to 18');
    
    const updatedProd2A = await request(app).get(`/api/products/${prod2AId}`);
    assert.strictEqual(updatedProd2A.body.product.stock, 27, 'Stock should be deducted from 30 to 27');
    console.log('   ✓ Stock levels accurately decremented');

    // Verify buyer cart is cleared
    const checkCart = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${buyerToken}`);
    assert.strictEqual(checkCart.body.cart.items.length, 0, 'Buyer cart must be cleared after order');
    console.log('   ✓ Buyer cart cleared');

    // 6. Seller Order Management & Status Updates
    console.log('\n6. Testing Seller Order Views & Status Updates...');
    
    const seller1Orders = await request(app)
      .get('/api/orders/shop-orders')
      .set('Authorization', `Bearer ${seller1Token}`);
    assert.strictEqual(seller1Orders.status, 200);
    assert.strictEqual(seller1Orders.body.orders.length, 1, 'Seller 1 must only see 1 order');
    assert.strictEqual(seller1Orders.body.orders[0].shopId.toString(), shop1Id.toString());

    // Seller 1 updates order status to 'confirmed'
    const updateStatusRes = await request(app)
      .put(`/api/orders/${seller1Orders.body.orders[0]._id}/status`)
      .set('Authorization', `Bearer ${seller1Token}`)
      .send({ status: 'confirmed' });
    assert.strictEqual(updateStatusRes.status, 200);
    assert.strictEqual(updateStatusRes.body.order.status, 'confirmed');
    console.log('   ✓ Seller 1 updated order status to confirmed');

    // 7. Admin Features (Categories & Global Orders)
    console.log('\n7. Testing Admin Categories and Global Orders Overview...');

    const categoryRes = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Organic Dairy', description: 'Fresh local milk and artisan cheese' });
    assert.strictEqual(categoryRes.status, 201);
    const catId = categoryRes.body.category._id;

    const allCats = await request(app).get('/api/categories');
    assert.strictEqual(allCats.status, 200);
    assert.ok(allCats.body.categories.some(c => c.name === 'Organic Dairy'));
    console.log('   ✓ Category created and verified in public list');

    const allOrders = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.strictEqual(allOrders.status, 200);
    assert.strictEqual(allOrders.body.orders.length, 2, 'Admin should see all 2 platform orders');
    console.log('   ✓ Admin successfully listed platform-wide orders');

    console.log('\n==================================================');
    console.log(' ALL TESTS PASSED SUCCESSFULLY! (100% PASS RATE) ');
    console.log('==================================================\n');

  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    await mongod.stop();
  }
};

runAllTests();

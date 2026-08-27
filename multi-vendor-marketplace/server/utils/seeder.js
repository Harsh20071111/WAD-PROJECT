const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

dotenv.config();

const seedData = async (mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/local-marketplace') => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Shop.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({})
    ]);

    console.log('Cleared existing collections.');

    // 1. Create Default Categories
    const categories = await Category.create([
      { name: 'Fresh Produce', description: 'Farm fresh fruits and vegetables' },
      { name: 'Artisan Bakery', description: 'Handcrafted sourdough, pastries, and bread' },
      { name: 'Dairy & Cheese', description: 'Locally crafted cheeses and organic dairy' },
      { name: 'Specialty Coffee', description: 'Locally roasted whole bean coffee and tea' },
      { name: 'Handmade Crafts', description: 'Handmade pottery, candles, and local home goods' }
    ]);
    console.log(`Created ${categories.length} categories.`);

    // 2. Create Users: 1 Admin, 2 Sellers, 1 Buyer
    const admin = await User.create({
      name: 'Market Admin',
      email: 'admin@localmart.com',
      password: 'password123',
      role: 'admin',
      phone: '+1 555-0100',
      address: '1 Admin Plaza, Suite 100'
    });

    const seller1 = await User.create({
      name: 'Alice Johnson',
      email: 'alice@bakery.com',
      password: 'password123',
      role: 'seller',
      phone: '+1 555-0101',
      address: '42 Baker Lane'
    });

    const seller2 = await User.create({
      name: 'Bob Miller',
      email: 'bob@farmfresh.com',
      password: 'password123',
      role: 'seller',
      phone: '+1 555-0102',
      address: '88 Orchard Road'
    });

    const buyer = await User.create({
      name: 'Charlie Davis',
      email: 'charlie@buyer.com',
      password: 'password123',
      role: 'buyer',
      phone: '+1 555-0103',
      address: '742 Evergreen Terrace, Springfield'
    });

    console.log('Created Demo Users (Admin, 2 Sellers, 1 Buyer).');

    // 3. Create Shops for Sellers (Approved)
    const shop1 = await Shop.create({
      sellerId: seller1._id,
      shopName: 'Artisan Crust Bakery',
      shopLogo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
      description: 'Daily fresh sourdough, buttery croissants, and handcrafted French pastries made from organic stoneground flour.',
      address: '42 Baker Lane, Downtown',
      isApproved: true
    });

    const shop2 = await Shop.create({
      sellerId: seller2._id,
      shopName: 'Valley Orchard Farm',
      shopLogo: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=400&q=80',
      description: 'Pesticide-free heirloom fruits, crisp orchard apples, and seasonal organic vegetables picked fresh daily.',
      address: '88 Orchard Road, East Valley',
      isApproved: true
    });

    console.log('Created and approved 2 distinct vendor shops.');

    // 4. Create Products strictly associated with each shop
    const productsShop1 = await Product.create([
      {
        shopId: shop1._id,
        name: 'Organic Country Sourdough Loaf',
        brand: 'Artisan Crust',
        description: 'Naturally fermented for 36 hours with wild yeast starter. Crispy crust and airy interior.',
        price: 8.50,
        stock: 25,
        category: 'Artisan Bakery',
        images: ['https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80']
      },
      {
        shopId: shop1._id,
        name: 'French Butter Croissant (Pack of 4)',
        brand: 'Artisan Crust',
        description: 'Flaky, buttery layers laminated with premium Normandy butter.',
        price: 12.00,
        stock: 15,
        category: 'Artisan Bakery',
        images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80']
      },
      {
        shopId: shop1._id,
        name: 'Cardamom Cinnamon Brioche',
        brand: 'Artisan Crust',
        description: 'Soft Swedish style brioche knot infused with freshly ground green cardamom and cinnamon.',
        price: 5.50,
        stock: 18,
        category: 'Artisan Bakery',
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80']
      }
    ]);

    const productsShop2 = await Product.create([
      {
        shopId: shop2._id,
        name: 'Crisp Honeycrisp Apples (3 lb bag)',
        brand: 'Valley Orchard',
        description: 'Sweet, juicy and intensely crunchy orchard apples picked at peak ripeness.',
        price: 7.99,
        stock: 30,
        category: 'Fresh Produce',
        images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80']
      },
      {
        shopId: shop2._id,
        name: 'Organic Wildflower Honey Jar (500g)',
        brand: 'Valley Orchard Apiary',
        description: 'Raw, unfiltered single-origin honey harvested from orchard wildflowers.',
        price: 14.50,
        stock: 20,
        category: 'Fresh Produce',
        images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80']
      },
      {
        shopId: shop2._id,
        name: 'Heirloom Rainbow Carrots (Bunch)',
        brand: 'Valley Orchard',
        description: 'Vibrant purple, yellow, and orange organic carrots freshly harvested with leafy greens attached.',
        price: 4.50,
        stock: 40,
        category: 'Fresh Produce',
        images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80']
      }
    ]);

    console.log(`Created ${productsShop1.length} products for Shop 1 and ${productsShop2.length} products for Shop 2.`);

    console.log('\n--- SEEDING COMPLETED SUCCESSFULLY ---');
    console.log('Demo Credentials:');
    console.log('  Buyer:   email: charlie@buyer.com     password: password123');
    console.log('  Seller1: email: alice@bakery.com      password: password123');
    console.log('  Seller2: email: bob@farmfresh.com     password: password123');
    console.log('  Admin:   email: admin@localmart.com   password: password123');

    return {
      admin,
      seller1,
      seller2,
      buyer,
      shop1,
      shop2,
      productsShop1,
      productsShop2,
      categories
    };
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
};

// If run directly via node seeder.js
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('Seeder script execution finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = seedData;

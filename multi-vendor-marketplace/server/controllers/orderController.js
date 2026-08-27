const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Shop = require('../models/Shop');

// @desc    Place order from cart (groups items by shopId into separate orders)
// @route   POST /api/orders
// @access  Private/Buyer
const placeOrder = async (req, res) => {
  try {
    const { deliveryAddress } = req.body;
    const finalAddress = deliveryAddress || req.user.address;

    if (!finalAddress || !finalAddress.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required'
      });
    }

    const cart = await Cart.findOne({ buyerId: req.user._id })
      .populate('items.productId')
      .populate('items.shopId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      });
    }

    // Verify all products still exist and have enough stock
    for (const item of cart.items) {
      if (!item.productId) {
        return res.status(400).json({
          success: false,
          message: 'One or more products in your cart are no longer available'
        });
      }
      if (item.productId.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product "${item.productId.name}". Available: ${item.productId.stock}, Requested: ${item.quantity}`
        });
      }
    }

    // Group items by shopId
    const shopGroupMap = {};
    for (const item of cart.items) {
      const shopIdStr = item.shopId._id ? item.shopId._id.toString() : item.shopId.toString();
      if (!shopGroupMap[shopIdStr]) {
        shopGroupMap[shopIdStr] = [];
      }
      shopGroupMap[shopIdStr].push(item);
    }

    const createdOrders = [];

    // Process each shop group as a separate Order document
    for (const [shopIdStr, items] of Object.entries(shopGroupMap)) {
      const orderProducts = items.map((item) => ({
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        quantity: item.quantity,
        image: item.productId.images?.[0] || ''
      }));

      const totalAmount = items.reduce(
        (sum, item) => sum + item.productId.price * item.quantity,
        0
      );

      const order = await Order.create({
        buyerId: req.user._id,
        shopId: shopIdStr,
        products: orderProducts,
        totalAmount,
        status: 'placed',
        deliveryAddress: finalAddress
      });

      // Deduct stock for each product
      for (const item of items) {
        await Product.findByIdAndUpdate(item.productId._id, {
          $inc: { stock: -item.quantity }
        });
      }

      createdOrders.push(order);
    }

    // Clear buyer's cart
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: `Successfully placed ${createdOrders.length} order(s)`,
      orders: createdOrders
    });
  } catch (error) {
    console.error('Place order error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error placing order'
    });
  }
};

// @desc    Get logged-in buyer's orders
// @route   GET /api/orders/my-orders
// @access  Private/Buyer
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id })
      .populate('shopId', 'shopName shopLogo address')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving orders'
    });
  }
};

// @desc    Get orders for seller's shop
// @route   GET /api/orders/shop-orders
// @access  Private/Seller
const getShopOrders = async (req, res) => {
  try {
    const sellerShop = await Shop.findOne({ sellerId: req.user._id });
    if (!sellerShop) {
      return res.status(200).json({
        success: true,
        orders: []
      });
    }

    const orders = await Order.find({ shopId: sellerShop._id })
      .populate('buyerId', 'name email phone address')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get shop orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving shop orders'
    });
  }
};

// @desc    Update order status (Seller only for their own shop)
// @route   PUT /api/orders/:id/status
// @access  Private/Seller
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`
      });
    }

    const sellerShop = await Shop.findOne({ sellerId: req.user._id });
    if (!sellerShop) {
      return res.status(403).json({
        success: false,
        message: 'You do not have a shop'
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      shopId: sellerShop._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found for your shop'
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating order status'
    });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getShopOrders,
  updateOrderStatus
};

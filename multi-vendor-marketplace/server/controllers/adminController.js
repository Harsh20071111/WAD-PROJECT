const Shop = require('../models/Shop');
const Category = require('../models/Category');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    List pending shops awaiting approval
// @route   GET /api/admin/shops/pending
// @access  Private/Admin
const listPendingShops = async (req, res) => {
  try {
    const shops = await Shop.find({ isApproved: false })
      .populate('sellerId', 'name email phone address')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: shops.length,
      shops
    });
  } catch (error) {
    console.error('List pending shops error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving pending shops'
    });
  }
};

// @desc    List all shops (both approved and pending)
// @route   GET /api/admin/shops
// @access  Private/Admin
const listAllShops = async (req, res) => {
  try {
    const shops = await Shop.find()
      .populate('sellerId', 'name email phone address')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: shops.length,
      shops
    });
  } catch (error) {
    console.error('List all shops error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving shops'
    });
  }
};

// @desc    Approve a shop
// @route   PUT /api/admin/shops/:id/approve
// @access  Private/Admin
const approveShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('sellerId', 'name email');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Shop "${shop.shopName}" approved successfully`,
      shop
    });
  } catch (error) {
    console.error('Approve shop error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error approving shop'
    });
  }
};

// @desc    Reject / Suspend a shop
// @route   PUT /api/admin/shops/:id/reject
// @access  Private/Admin
const rejectShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    ).populate('sellerId', 'name email');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Shop "${shop.shopName}" approval suspended/rejected`,
      shop
    });
  } catch (error) {
    console.error('Reject shop error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error rejecting shop'
    });
  }
};

// @desc    Get all categories
// @route   GET /api/admin/categories (also accessible publicly)
// @access  Public / Admin
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving categories'
    });
  }
};

// @desc    Create a category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating category'
    });
  }
};

// @desc    Delete a category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting category'
    });
  }
};

// @desc    List all platform orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const listAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyerId', 'name email phone')
      .populate('shopId', 'shopName shopLogo address')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('List all orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving orders'
    });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalShops, pendingShops, totalOrders] = await Promise.all([
      User.countDocuments(),
      Shop.countDocuments({ isApproved: true }),
      Shop.countDocuments({ isApproved: false }),
      Order.countDocuments()
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalShops,
        pendingShops,
        totalOrders
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving stats'
    });
  }
};

module.exports = {
  listPendingShops,
  listAllShops,
  approveShop,
  rejectShop,
  getCategories,
  createCategory,
  deleteCategory,
  listAllOrders,
  getAdminStats
};

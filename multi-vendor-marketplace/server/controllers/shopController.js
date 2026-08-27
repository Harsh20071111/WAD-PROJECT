const Shop = require('../models/Shop');
const { uploadBuffer } = require('../config/cloudinary');

// @desc    Create a new shop (Seller only)
// @route   POST /api/shops
// @access  Private/Seller
const createShop = async (req, res) => {
  try {
    const existingShop = await Shop.findOne({ sellerId: req.user._id });
    if (existingShop) {
      return res.status(400).json({
        success: false,
        message: 'Seller already has a shop registered'
      });
    }

    const { shopName, description, address } = req.body;
    let shopLogo = req.body.shopLogo || '';

    if (!shopName) {
      return res.status(400).json({
        success: false,
        message: 'Shop name is required'
      });
    }

    // If file was uploaded via multer, stream to cloudinary
    if (req.file) {
      try {
        const uploadRes = await uploadBuffer(req.file.buffer, 'shops');
        shopLogo = uploadRes.url;
      } catch (uploadErr) {
        console.warn('Cloudinary upload warning (using fallback/text URL):', uploadErr.message);
      }
    }

    const shop = await Shop.create({
      sellerId: req.user._id,
      shopName,
      shopLogo,
      description: description || '',
      address: address || '',
      isApproved: false // Requires admin approval
    });

    return res.status(201).json({
      success: true,
      message: 'Shop created successfully. Awaiting admin approval.',
      shop
    });
  } catch (error) {
    console.error('Create shop error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating shop'
    });
  }
};

// @desc    Update seller's own shop
// @route   PUT /api/shops/my-shop
// @access  Private/Seller
const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ sellerId: req.user._id });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found for this seller'
      });
    }

    const { shopName, description, address, shopLogo } = req.body;

    if (shopName) shop.shopName = shopName;
    if (description !== undefined) shop.description = description;
    if (address !== undefined) shop.address = address;
    if (shopLogo !== undefined) shop.shopLogo = shopLogo;

    if (req.file) {
      try {
        const uploadRes = await uploadBuffer(req.file.buffer, 'shops');
        shop.shopLogo = uploadRes.url;
      } catch (uploadErr) {
        console.warn('Cloudinary upload warning:', uploadErr.message);
      }
    }

    await shop.save();

    return res.status(200).json({
      success: true,
      message: 'Shop updated successfully',
      shop
    });
  } catch (error) {
    console.error('Update shop error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating shop'
    });
  }
};

// @desc    Get logged-in seller's shop
// @route   GET /api/shops/my-shop
// @access  Private/Seller
const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ sellerId: req.user._id });
    return res.status(200).json({
      success: true,
      shop: shop || null
    });
  } catch (error) {
    console.error('Get my shop error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving your shop'
    });
  }
};

// @desc    Get single approved shop by ID
// @route   GET /api/shops/:id
// @access  Public
const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('sellerId', 'name email phone');
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Public users can only see approved shops
    if (!shop.isApproved) {
      // If user is authenticated and is the owner or admin, they can view it
      const isOwner = req.user && req.user._id.toString() === shop.sellerId._id.toString();
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Shop is not approved yet'
        });
      }
    }

    return res.status(200).json({
      success: true,
      shop
    });
  } catch (error) {
    console.error('Get shop by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving shop'
    });
  }
};

// @desc    List all approved shops (Public browsing)
// @route   GET /api/shops
// @access  Public
const listApprovedShops = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { isApproved: true };

    if (search) {
      filter.$or = [
        { shopName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    const shops = await Shop.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: shops.length,
      shops
    });
  } catch (error) {
    console.error('List approved shops error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving shops'
    });
  }
};

module.exports = {
  createShop,
  updateShop,
  getMyShop,
  getShopById,
  listApprovedShops
};

const Product = require('../models/Product');
const Shop = require('../models/Shop');
const { uploadBuffer } = require('../config/cloudinary');

// @desc    Add a product (Seller only)
// @route   POST /api/products
// @access  Private/Seller
// Core Rule: shopId is strictly derived from req.user's shop, never from req.body
const addProduct = async (req, res) => {
  try {
    const sellerShop = await Shop.findOne({ sellerId: req.user._id });
    if (!sellerShop) {
      return res.status(400).json({
        success: false,
        message: 'You must create a shop before adding products'
      });
    }

    const { name, brand, description, price, stock, category } = req.body;
    let images = [];

    // If images array / strings passed in body
    if (req.body.images) {
      if (Array.isArray(req.body.images)) {
        images = req.body.images;
      } else if (typeof req.body.images === 'string') {
        images = [req.body.images];
      }
    }

    // Handle single/multiple uploaded files via multer
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const uploadRes = await uploadBuffer(file.buffer, 'products');
          images.push(uploadRes.url);
        } catch (uploadErr) {
          console.warn('Cloudinary upload warning:', uploadErr.message);
        }
      }
    } else if (req.file) {
      try {
        const uploadRes = await uploadBuffer(req.file.buffer, 'products');
        images.push(uploadRes.url);
      } catch (uploadErr) {
        console.warn('Cloudinary upload warning:', uploadErr.message);
      }
    }

    if (!name || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Product name and price are required'
      });
    }

    const product = await Product.create({
      shopId: sellerShop._id, // Strictly derived from authenticated seller's shop
      name,
      brand: brand || '',
      description: description || '',
      price: Number(price),
      stock: stock !== undefined ? Number(stock) : 0,
      images,
      category: category || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Add product error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating product'
    });
  }
};

// @desc    Update a product (Seller only, must own the product's shop)
// @route   PUT /api/products/:id
// @access  Private/Seller
const updateProduct = async (req, res) => {
  try {
    const sellerShop = await Shop.findOne({ sellerId: req.user._id });
    if (!sellerShop) {
      return res.status(403).json({
        success: false,
        message: 'You do not have a registered shop'
      });
    }

    // Find product ensuring it belongs strictly to this seller's shop
    const product = await Product.findOne({
      _id: req.params.id,
      shopId: sellerShop._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you are not authorized to edit this product'
      });
    }

    const { name, brand, description, price, stock, category } = req.body;

    if (name !== undefined) product.name = name;
    if (brand !== undefined) product.brand = brand;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (category !== undefined) product.category = category;

    if (req.body.images) {
      if (Array.isArray(req.body.images)) {
        product.images = req.body.images;
      } else if (typeof req.body.images === 'string') {
        product.images = [req.body.images];
      }
    }

    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const uploadRes = await uploadBuffer(file.buffer, 'products');
          product.images.push(uploadRes.url);
        } catch (uploadErr) {
          console.warn('Cloudinary upload warning:', uploadErr.message);
        }
      }
    } else if (req.file) {
      try {
        const uploadRes = await uploadBuffer(req.file.buffer, 'products');
        product.images.push(uploadRes.url);
      } catch (uploadErr) {
        console.warn('Cloudinary upload warning:', uploadErr.message);
      }
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating product'
    });
  }
};

// @desc    Delete a product (Seller only, must own the product's shop)
// @route   DELETE /api/products/:id
// @access  Private/Seller
const deleteProduct = async (req, res) => {
  try {
    const sellerShop = await Shop.findOne({ sellerId: req.user._id });
    if (!sellerShop) {
      return res.status(403).json({
        success: false,
        message: 'You do not have a registered shop'
      });
    }

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      shopId: sellerShop._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you are not authorized to delete this product'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting product'
    });
  }
};

// @desc    Get all products for logged-in seller's shop
// @route   GET /api/products/my-products
// @access  Private/Seller
const getMyProducts = async (req, res) => {
  try {
    const sellerShop = await Shop.findOne({ sellerId: req.user._id });
    if (!sellerShop) {
      return res.status(200).json({
        success: true,
        products: []
      });
    }

    const products = await Product.find({ shopId: sellerShop._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get my products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving products'
    });
  }
};

// @desc    Get products by specific shop ID (Isolation boundary test)
// @route   GET /api/shops/:shopId/products
// @access  Public
const getProductsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { category, search } = req.query;

    const filter = { shopId };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get products by shop error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving shop products'
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('shopId', 'shopName shopLogo address isApproved');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving product'
    });
  }
};

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getProductsByShop,
  getProductById
};

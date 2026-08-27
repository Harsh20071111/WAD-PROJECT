const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get logged-in buyer's cart
// @route   GET /api/cart
// @access  Private/Buyer
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ buyerId: req.user._id })
      .populate('items.productId')
      .populate('items.shopId', 'shopName shopLogo address');

    if (!cart) {
      cart = await Cart.create({
        buyerId: req.user._id,
        items: []
      });
    }

    return res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving cart'
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private/Buyer
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const qty = parseInt(quantity, 10) || 1;
    if (qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    let cart = await Cart.findOne({ buyerId: req.user._id });
    if (!cart) {
      cart = new Cart({
        buyerId: req.user._id,
        items: []
      });
    }

    // Check if product already exists in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (existingIndex > -1) {
      const newTotalQty = cart.items[existingIndex].quantity + qty;
      if (product.stock < newTotalQty) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Stock limit of ${product.stock} reached`
        });
      }
      cart.items[existingIndex].quantity = newTotalQty;
    } else {
      cart.items.push({
        productId: product._id,
        shopId: product.shopId, // Always derived from actual product
        quantity: qty
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId')
      .populate('items.shopId', 'shopName shopLogo address');

    return res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart: populatedCart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error adding to cart'
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private/Buyer
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ buyerId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    const qty = parseInt(quantity, 10);

    if (qty <= 0) {
      // Remove item
      cart.items.pull(itemId);
    } else {
      const product = await Product.findById(item.productId);
      if (!product) {
        cart.items.pull(itemId);
      } else {
        if (product.stock < qty) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} items available in stock`
          });
        }
        item.quantity = qty;
      }
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId')
      .populate('items.shopId', 'shopName shopLogo address');

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: populatedCart
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating cart'
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private/Buyer
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ buyerId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items.pull(itemId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId')
      .populate('items.shopId', 'shopName shopLogo address');

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: populatedCart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error removing item from cart'
    });
  }
};

// @desc    Clear all items in cart
// @route   DELETE /api/cart
// @access  Private/Buyer
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyerId: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart: { items: [] }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error clearing cart'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};

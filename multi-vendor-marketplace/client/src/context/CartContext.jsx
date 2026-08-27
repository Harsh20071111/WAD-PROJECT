import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getCart as getCartService,
  addToCart as addToCartService,
  updateCartItem as updateCartItemService,
  removeFromCart as removeFromCartService,
  clearCart as clearCartService,
} from '../services/cart';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  // Fetch cart whenever logged in as a buyer
  const fetchCart = useCallback(async () => {
    if (isAuthenticated && user?.role === 'buyer') {
      try {
        setLoading(true);
        const data = await getCartService();
        if (data && data.cart) {
          setCart(data.cart);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setCart({ items: [] });
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    try {
      const data = await addToCartService(productId, quantity);
      if (data && data.cart) {
        setCart(data.cart);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateQty = async (itemId, quantity) => {
    try {
      const data = await updateCartItemService(itemId, quantity);
      if (data && data.cart) {
        setCart(data.cart);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const removeItem = async (itemId) => {
    try {
      const data = await removeFromCartService(itemId);
      if (data && data.cart) {
        setCart(data.cart);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const data = await clearCartService();
      if (data && data.cart) {
        setCart(data.cart);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const items = cart?.items || [];

  // Derived metrics
  const itemCount = items.reduce((acc, item) => acc + (item.quantity || 0), 0);

  const subtotal = items.reduce((acc, item) => {
    const price = item.productId?.price || 0;
    return acc + price * (item.quantity || 0);
  }, 0);

  // Group items by shop for multi-vendor checkout visibility
  const groupedByShop = items.reduce((groups, item) => {
    const shop = item.shopId;
    const shopId = shop?._id || 'unknown';
    if (!groups[shopId]) {
      groups[shopId] = {
        shop: shop || { shopName: 'Local Shop' },
        items: [],
        shopTotal: 0,
      };
    }
    groups[shopId].items.push(item);
    const price = item.productId?.price || 0;
    groups[shopId].shopTotal += price * (item.quantity || 0);
    return groups;
  }, {});

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        subtotal,
        groupedByShop,
        loading,
        fetchCart,
        addItem,
        updateQty,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;

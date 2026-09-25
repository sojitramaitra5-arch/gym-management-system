import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'hulk_fitness_cart';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const addToCart = (product, quantity = 1) => {
    if (!product || !product.id) return;
    const addQty = Math.max(1, parseInt(quantity) || 1);
    const maxStock = parseInt(product.stock) || 99;
    const price = Number(product.price) || 0;
    const discountPrice =
      Number(product.discount_price) > 0 ? Number(product.discount_price) : price;

    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      const newQty = Math.min(existingItem.quantity + addQty, maxStock);
      showToast(`Updated ${product.name} quantity to ${newQty}`);
    } else {
      showToast(`Added ${product.name} to cart`);
    }

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const item = prevItems[existingIndex];
        const newQty = Math.min(item.quantity + addQty, maxStock);
        const updated = [...prevItems];
        updated[existingIndex] = { ...item, quantity: newQty };
        return updated;
      } else {
        const newItem = {
          id: product.id,
          name: product.name,
          brand: product.brand,
          flavor: product.flavor,
          weight_size: product.weight_size,
          price: price,
          discount_price: discountPrice,
          stock: maxStock,
          image_url: product.image_url,
          quantity: Math.min(addQty, maxStock)
        };
        return [...prevItems, newItem];
      }
    });
  };

  const updateQuantity = (productId, quantity) => {
    const qty = parseInt(quantity);
    setCartItems((prevItems) => {
      if (qty <= 0) {
        return prevItems.filter((item) => item.id !== productId);
      }
      return prevItems.map((item) => {
        if (item.id === productId) {
          const maxStock = item.stock || 99;
          return { ...item, quantity: Math.min(qty, maxStock) };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId) => {
    const itemToRemove = cartItems.find((item) => item.id === productId);
    if (itemToRemove) {
      showToast(`Removed ${itemToRemove.name} from cart`);
    }
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

  const totalDiscountPrice = cartItems.reduce((acc, item) => {
    const originalPrice = Number(item.price) || 0;
    const effectiveDiscountPrice =
      Number(item.discount_price) > 0 ? Number(item.discount_price) : originalPrice;
    const qty = Number(item.quantity) || 1;
    return acc + effectiveDiscountPrice * qty;
  }, 0);

  const totalOriginalPrice = cartItems.reduce((acc, item) => {
    const originalPrice = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + originalPrice * qty;
  }, 0);

  const totalSavings = Math.max(0, totalOriginalPrice - totalDiscountPrice);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        totalDiscountPrice,
        totalOriginalPrice,
        totalSavings,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toastMessage,
        dismissToast: () => setToastMessage(null)
      }}
    >
      {children}
      {toastMessage && (
        <div
          className="position-fixed bottom-0 end-0 p-3"
          style={{ zIndex: 1090 }}
        >
          <div className="toast show align-items-center text-white bg-dark border border-success shadow-lg rounded-3 py-1 px-2">
            <div className="d-flex align-items-center">
              <div className="toast-body d-flex align-items-center gap-2 small">
                <i className="bi bi-cart-check-fill text-success fs-6"></i>
                <span className="fw-semibold">{toastMessage}</span>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                style={{ fontSize: '0.65rem' }}
                onClick={() => setToastMessage(null)}
              ></button>
            </div>
          </div>
        </div>
      )}
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

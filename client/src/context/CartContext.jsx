import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);


  const addToCart = (item, selectedAddons = []) => {
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0)
    const effectivePrice = item.price + addonsTotal

    // Each combination of item + addons is a unique cart entry
    const cartKey = item._id + (selectedAddons.length
      ? '_' + selectedAddons.map(a => a.name).join('_')
      : '')

    setCartItems(prev => {
      const existing = prev.find(i => i.cartKey === cartKey)
      if (existing) {
        return prev.map(i =>
          i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, {
        ...item,
        cartKey,
        price: effectivePrice,
        basePrice: item.price,
        selectedAddons,
        quantity: 1
      }]
    })
  }


const removeFromCart = (cartKey) => {
  setCartItems(prev => prev.filter(i => i.cartKey !== cartKey))
}

const updateQuantity = (cartKey, qty) => {
  if (qty === 0) return removeFromCart(cartKey)
  setCartItems(prev =>
    prev.map(i => i.cartKey === cartKey ? { ...i, quantity: qty } : i)
  )
}

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart,
      updateQuantity, clearCart,
      isCartOpen, setIsCartOpen,
      totalItems, totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
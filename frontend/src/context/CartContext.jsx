import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const readLS = (k, d) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : d;
  } catch {
    return d;
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readLS("dd_cart", []));
  const [wishlist, setWishlist] = useState(() => readLS("dd_wishlist", []));

  useEffect(() => {
    localStorage.setItem("dd_cart", JSON.stringify(items));
  }, [items]);
  useEffect(() => {
    localStorage.setItem("dd_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const lineKey = (id, size, color) => `${id}__${size}__${color}`;

  const addToCart = (product, size, color, qty = 1) => {
    setItems((prev) => {
      const key = lineKey(product.id, size, color);
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images[0],
          price: product.price,
          mrp: product.mrp,
          size,
          color,
          qty,
        },
      ];
    });
  };

  const removeFromCart = (key) => setItems((prev) => prev.filter((i) => i.key !== key));
  const updateQty = (key, qty) =>
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i))
    );
  const clearCart = () => setItems([]);
  // Refill the bag from a saved checkout (the "complete your order" email link).
  const replaceCart = (lines) =>
    setItems(lines.map((l) => ({ key: lineKey(l.id, l.size, l.color), ...l })));

  const toggleWishlist = (productId) =>
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((p) => p !== productId) : [...prev, productId]
    );
  const inWishlist = (productId) => wishlist.includes(productId);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const mrpTotal = items.reduce((s, i) => s + i.mrp * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        wishlist,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        replaceCart,
        toggleWishlist,
        inWishlist,
        count,
        subtotal,
        mrpTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// src/context/CartContext.jsx

// Importamos useEffect que usaremos para guardar en localStorage
import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Creamos el contexto
const CartContext = createContext();

// 2. Creamos un "hook" personalizado para usar el contexto fácilmente
export const useCart = () => useContext(CartContext);

// 3. Creamos el "Proveedor" que contendrá la lógica del carrito
export const CartProvider = ({ children }) => {
  
  // Modificamos el estado inicial para que CARGUE desde localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('cartItems');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Error al cargar carrito de localStorage", error);
      return [];
    }
  });

  // AÑADIDO: Guardamos en localStorage CADA VEZ que el carrito cambie
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // --- Función para añadir un producto (Tu código original) ---
  const addToCart = (product) => {
    setCartItems(currentItems => {
      // 1. Revisa si el producto ya está en el carrito
      const existingItem = currentItems.find(item => item.id === product.id);

      // 2. Si ya existe, solo incrementa la cantidad
      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // 3. Si es nuevo, lo añade al array con cantidad 1
      return [...currentItems, { ...product, quantity: 1 }];
    });
    // Quitamos el alert para una mejor experiencia de usuario
    // alert(`${product.name} añadido al carrito!`); 
  };

  // --- Función para vaciar el carrito (Tu código original) ---
  const clearCart = () => {
    setCartItems([]);
  };

  // --- 1. FUNCIÓN AÑADIDA: Eliminar un item del carrito ---
  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      return prevItems.filter(item => item.id !== productId);
    });
  };

  // --- 2. FUNCIÓN AÑADIDA: Actualizar la cantidad de un item ---
  const updateItemQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      // Si la cantidad baja a 0, lo eliminamos
      removeFromCart(productId);
    } else {
      setCartItems(prevItems => {
        return prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        );
      });
    }
  };

  // 4. Pasamos el estado y las funciones a los componentes "hijos"
  const value = {
    cartItems,
    addToCart,
    clearCart,
    removeFromCart,     // <--- 3. AÑADIDA AL VALOR
    updateItemQuantity  // <--- 4. AÑADIDA AL VALOR
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
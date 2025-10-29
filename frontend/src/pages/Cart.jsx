// frontend/src/pages/Cart.jsx (Función handleCheckout CORREGIDA)

import React, { useState } from 'react'
import { useCart } from '../context/CartContext'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
// Importamos los íconos que usaremos
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi'

export default function Cart() {
  // --- LÓGICA DEL CONTEXTO (SIN CAMBIOS) ---
  const { cartItems, clearCart, updateItemQuantity, removeFromCart } = useCart()
  
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // --- CÁLCULO DE TOTAL (SIN CAMBIOS) ---
  const total = cartItems.reduce((acc, item) => {
    return acc + (item.price * item.quantity)
  }, 0)

  // ======================================================
  // === INICIO DE LA FUNCIÓN handleCheckout (ACTUALIZADA) ===
  // ======================================================
  const handleCheckout = async () => {
    setLoading(true)

    // --- 1. OBTENEMOS LA SESIÓN ACTUAL PARA CONSEGUIR EL TOKEN ---
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        navigate('/auth');
        setLoading(false);
        return;
    }
    // ¡Este es el token que necesitamos!
    const token = session.access_token;
    // -----------------------------------------------------------

    try {
      const response = await fetch(
        'https://kdnfuyrregwuhqzclnix.supabase.co/functions/v1/create-checkout-session',
        {
          method: 'POST',
          // --- 2. AÑADIMOS EL TOKEN A LOS HEADERS ---
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // <-- ¡ESTA ES LA LÍNEA CLAVE!
          },
          // ------------------------------------------
          body: JSON.stringify({ cartItems: cartItems })
        }
      )

      console.log("Respuesta RECIBIDA del backend (status):", response.status);
      const data = await response.json()
      console.log("Respuesta RECIBIDA del backend (body):", data);

      if (!response.ok) {
        throw new Error(data.error || `Error del servidor: ${response.status}`)
      }

      const sessionUrl = data.sessionUrl;
      console.log("URL Extraída:", sessionUrl);

      if (!sessionUrl) {
        throw new Error('No se recibió la URL de sesión de Stripe.')
      }

      window.location.href = sessionUrl;

    } catch (error) {
      console.error("Error en el checkout:", error);
      alert(`Error al procesar el pago: ${error.message}`);
      setLoading(false);
    }
  }
  // ======================================================
  // === FIN DE LA FUNCIÓN handleCheckout ===
  // ======================================================


  // --- VISTA DE CARRITO VACÍO (SIN CAMBIOS) ---
  if (cartItems.length === 0) {
    return (
      <div className='max-w-2xl mx-auto my-12 text-center p-8 bg-white rounded-lg shadow-md border border-gray-200'>
        <h1 className='text-3xl font-bold text-gray-800 mb-4'>Tu carrito está vacío</h1>
        <p className="text-gray-600 mb-6">Parece que aún no has añadido nada. ¡Explora nuestros productos!</p>
        <Link 
          to="/" 
          className='inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors'
        >
          Ir a la Tienda
        </Link>
      </div>
    )
  }

  // --- VISTA PRINCIPAL DEL CARRITO (SIN CAMBIOS) ---
  return (
    <div className="max-w-6xl mx-auto my-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Tu Carrito</h1>
      
      {/* Layout de Grid (móvil 1 col, desktop 2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* === COLUMNA IZQUIERDA: ITEMS === */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          {cartItems.map(item => (
            // --- Tarjeta de Item Individual ---
            <div key={item.id} className="flex flex-col md:flex-row items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              
              {/* Imagen */}
              <img 
                src={item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/100'} 
                alt={item.name} 
                className="w-full md:w-24 h-24 object-cover rounded-md mb-4 md:mb-0" 
              />
              
              {/* Detalles (Nombre y Precio) */}
              <div className="flex-grow text-center md:text-left">
                <Link to={`/product/${item.id}`} className="font-semibold text-lg text-gray-800 hover:underline">
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500">${item.price.toFixed(2)} c/u</p>
              </div>
              
              {/* Controles de Cantidad */}
              <div className="flex items-center space-x-2 border border-gray-300 rounded-lg p-1 my-4 md:my-0">
                <button 
                  onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              
              {/* Subtotal del Item */}
              <span className="font-semibold text-lg w-24 text-right">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
              
              {/* Botón de Eliminar */}
              <button 
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* === COLUMNA DERECHA: RESUMEN === */}
        <div className="lg:col-span-1 bg-gray-50 border border-gray-200 rounded-lg p-6 h-fit sticky top-8">
          <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">Resumen de Compra</h2>
          
          <div className="flex justify-between mb-2 text-gray-600">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-4 text-gray-600">
            <span>Envío</span>
            <span className='font-medium text-green-600'>Gratis</span>
          </div>
          
          <div className="border-t border-gray-300 my-4"></div>
          
          <div className="flex justify-between text-lg font-bold text-gray-900 mt-2">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          
          {/* Botón de Pagar (Tu código original) */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className='w-full mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition-colors disabled:bg-gray-400'
          >
            {loading ? 'Redirigiendo a pago seguro...' : 'Pagar con Tarjeta'}
          </button>
          
          {/* Botón de Vaciar Carrito (Nuevo) */}
          <button
            onClick={clearCart}
            className="w-full mt-3 text-sm text-red-600 hover:underline"
          >
            Vaciar Carrito
          </button>
        </div>
        
      </div>
    </div>
  )
}
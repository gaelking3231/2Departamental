// frontend/src/pages/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabaseClient'; // <-- Importa Supabase

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart, cartItems } = useCart(); // <-- Obtenemos cartItems ANTES de limpiar
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMsg('No se encontró ID de sesión de Stripe.');
      return;
    }

    // Guardamos una copia de los items ANTES de limpiar el carrito
    const itemsToSave = [...cartItems]; 

    const verifyAndSaveOrder = async () => {
      try {
        // 1. Llama a la nueva Edge Function para verificar
        const response = await fetch(
          // URL de tu nueva función
          'https://kdnfuyrregwuhqzclnix.supabase.co/functions/v1/verify-stripe-session', 
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId })
          }
        )
        const data = await response.json();

        console.log("Verification response:", data); // Log para depurar

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'La verificación del pago falló.');
        }

        // 2. Si la verificación fue exitosa, GUARDAMOS el pedido en Supabase
        //    (Usamos los 'itemsToSave' que guardamos antes de limpiar)

        // a) Obtener usuario actual
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Usuario no encontrado para guardar el pedido.");

        // b) Calcular total (de los items guardados)
        const total = itemsToSave.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // c) Crear el pedido en 'orders'
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            total: total, // Usa 'total'
            status: 'paid', // Marcamos como pagado
            shipping_address: 'Pendiente de Perfil', // O obtén del perfil si lo implementas
            // Opcional: Guarda el ID de sesión de Stripe si quieres
            // stripe_session_id: sessionId 
          })
          .select()
          .single()
        if (orderError) throw orderError;

        // d) Crear los 'order_items'
        const orderItemsToInsert = itemsToSave.map(item => ({
          order_id: orderData.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price // Precio al momento de la compra
        }))
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItemsToInsert)
        if (itemsError) throw itemsError;

        // --- 3. ACTUALIZAR STOCK ---
        // ¡Importante! Esto debe hacerse con cuidado en producción (idealmente con transacciones o funciones RPC)
        // Aquí hacemos una versión simple: actualizamos cada producto uno por uno.
        for (const item of itemsToSave) {
          const { error: stockError } = await supabase.rpc('decrease_product_stock', {
            product_id_to_update: item.id,
            quantity_to_decrease: item.quantity
          })
           if (stockError) console.error(`Error actualizando stock para ${item.name}:`, stockError); // Logueamos pero continuamos
        }
        // --- Fin Actualizar Stock ---

        // 4. Limpiar el carrito (ahora que todo se guardó)
        console.log("Pedido guardado, limpiando carrito...");
        clearCart();
        setStatus('success');

      } catch (err) {
        console.error("Error en success page:", err);
        setErrorMsg(err.message);
        setStatus('error');
      }
    };

    verifyAndSaveOrder();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]); // Depende de sessionId

  // --- Renderizado Condicional ---
  if (status === 'verifying') {
    return <div className="text-center p-8"><h1 className="text-xl">Verificando pago...</h1></div>;
  }

  if (status === 'error') {
    return (
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Error en el Pago</h1>
        <p className="text-lg mb-6">Hubo un problema al verificar tu pago:</p>
        <p className="text-md text-red-700 bg-red-100 p-3 rounded mb-6">{errorMsg}</p>
        <Link to="/cart" className="text-blue-600 hover:underline">Volver al Carrito</Link>
      </div>
    );
  }

  // Si status === 'success'
  return (
    <div className="text-center p-8">
      <h1 className="text-3xl font-bold text-green-600 mb-4">¡Pago Exitoso y Pedido Guardado!</h1>
      <p className="text-lg mb-6">Gracias por tu compra. Puedes ver tu pedido en tu historial.</p>
      <Link 
        to="/orders" 
        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors mr-4"
      >
        Ver Mis Pedidos
      </Link>
      <Link 
        to="/" 
        className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        Seguir Comprando
      </Link>
    </div>
  );
}
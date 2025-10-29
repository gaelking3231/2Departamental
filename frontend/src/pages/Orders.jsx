// frontend/src/pages/Orders.jsx (Diseño Mejorado)

import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'

// Objeto para mapear estados a clases de Tailwind (para los badges)
const statusClasses = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  shipped: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    
    // --- CONSULTA MODIFICADA (para traer 'images') ---
    const { data, error } = await supabase
      .from('orders')
      //  ¡AQUÍ ESTÁ EL CAMBIO IMPORTANTE!
      .select(`id, created_at, total, status, order_items(quantity, price, products(name, images))`) 
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      
    if (error) { console.error('Error fetching orders:', error) }
    else { setOrders(data) }
    setLoading(false)
  }

  // --- VISTA DE CARGA (SIN CAMBIOS) ---
  if (loading) {
    return <div className='p-4 text-center'>Cargando pedidos...</div>
  }

  // --- VISTA DE PEDIDOS VACÍOS (MEJORADA) ---
  if (orders.length === 0) {
    return (
      <div className='max-w-2xl mx-auto my-12 text-center p-8 bg-white rounded-lg shadow-md border border-gray-200'>
        <h1 className='text-3xl font-bold text-gray-800 mb-4'>No tienes pedidos</h1>
        <p className="text-gray-600 mb-6">Todos tus pedidos aparecerán aquí.</p>
        <Link 
          to="/" 
          className='inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors'
        >
          Ir a la Tienda
        </Link>
      </div>
    )
  }

  // --- VISTA PRINCIPAL (NUEVO DISEÑO DE TARJETAS) ---
  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      <h1 className='text-3xl font-bold mb-6 text-gray-900'>Mis Pedidos</h1>
      
      <div className='space-y-6'>
        {orders.map(order => {
          // Acortamos el ID para que sea más legible
          const shortId = order.id.split('-')[0].toUpperCase();
          
          return (
            // --- La Tarjeta de Pedido ---
            <div key={order.id} className='bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200'>
              
              {/* === 1. Encabezado de la Tarjeta === */}
              <div className='flex flex-col md:flex-row justify-between md:items-center p-4 bg-gray-50 border-b border-gray-200 gap-2'>
                <div>
                  <h2 className='text-lg font-semibold text-gray-800'>Pedido #{shortId}</h2>
                  <p className='text-sm text-gray-500'>
                    Realizado el: {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`py-1 px-3 rounded-full text-xs font-bold capitalize self-start md:self-center ${statusClasses[order.status] || 'bg-gray-100 text-gray-800'}`}>
                  {order.status}
                </span>
              </div>

              {/* === 2. Cuerpo (¡CON IMÁGENES!) === */}
              <div className='p-6'>
                <h3 className="text-md font-semibold mb-4 text-gray-700">Productos en este pedido:</h3>
                
                {/* Lista horizontal de imágenes de productos */}
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="flex-shrink-0 w-20 text-center">
                      
                      {/* La Imagen */}
                      <div className="w-20 h-20 rounded-md bg-gray-100 overflow-hidden border border-gray-200">
                        {item.products && item.products.images && item.products.images.length > 0 ? (
                          <img 
                            src={item.products.images[0]} 
                            alt={item.products.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">Sin imagen</div>
                        )}
                      </div>
                      
                      {/* Nombre y Cantidad */}
                      <p className="text-xs text-gray-600 mt-1 truncate" title={item.products.name}>
                        {item.products.name}
                      </p>
                      <p className="text-xs font-medium text-gray-800">
                        (x{item.quantity})
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* === 3. Pie de Página de la Tarjeta === */}
              <div className='flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200'>
                <span className='text-xl font-bold text-gray-900'>
                  Total: ${order.total ? order.total.toFixed(2) : '0.00'}
                </span>
                <Link 
                  // Puedes crear esta ruta más adelante si quieres
                  to={`/orders/${order.id}`} 
                  className='bg-gray-800 text-white py-2 px-4 rounded-md font-semibold text-sm hover:bg-gray-700 transition-colors'
                >
                  Ver Detalles
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
// src/pages/OrderDetail.jsx (NUEVO ARCHIVO)

import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { FiArrowLeft } from 'react-icons/fi' // Icono para "volver"

// Copiamos el mismo objeto de `Orders.jsx` para los badges de estado
const statusClasses = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  shipped: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function OrderDetail() {
  const { id } = useParams() // Obtenemos el ID del pedido desde la URL
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Esta función cargará los detalles de UN solo pedido
    async function fetchOrderDetails() {
      setLoading(true)
      
      // Hacemos la consulta a Supabase pidiendo el pedido que coincida con el ID
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, 
          created_at, 
          total, 
          status, 
          order_items (
            quantity, 
            price, 
            products (name, images)
          )
        `)
        .eq('id', id) // El filtro clave: donde el ID coincida
        .single() // Esperamos solo un resultado

      if (error) {
        console.error('Error fetching order details:', error)
        setOrder(null)
      } else {
        setOrder(data)
      }
      setLoading(false)
    }

    if (id) {
      fetchOrderDetails()
    }
  }, [id]) // El 'useEffect' se ejecuta cada vez que el 'id' de la URL cambie

  // --- Renderizado de Carga ---
  if (loading) {
    return <div className='p-4 text-center'>Cargando detalles del pedido...</div>
  }

  // --- Renderizado de Error/No Encontrado ---
  if (!order) {
    return <div className='p-4 text-center text-red-600'>Pedido no encontrado o error al cargar.</div>
  }

  // --- Renderizado Principal (Si encontramos el pedido) ---
  const shortId = order.id.split('-')[0].toUpperCase();

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      
      {/* 1. Botón de Volver a "Mis Pedidos" */}
      <Link 
        to="/orders" 
        className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4"
      >
        <FiArrowLeft />
        Volver a Mis Pedidos
      </Link>

      {/* 2. Tarjeta de Detalles del Pedido */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        
        {/* Encabezado */}
        <div className='flex flex-col md:flex-row justify-between md:items-center p-6 bg-gray-50 border-b border-gray-200 gap-2'>
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>Detalle del Pedido #{shortId}</h1>
            <p className='text-sm text-gray-500'>
              Realizado el: {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <span className={`py-1 px-3 rounded-full text-sm font-bold capitalize self-start md:self-center ${statusClasses[order.status] || 'bg-gray-100 text-gray-800'}`}>
            {order.status}
          </span>
        </div>

        {/* Lista de Productos en el Pedido */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Productos</h2>
          <ul className="divide-y divide-gray-200">
            
            {order.order_items.map((item, index) => (
              <li key={index} className="flex items-center py-4 space-x-4">
                
                {/* Imagen */}
                <div className="w-20 h-20 rounded-md bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
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
                
                {/* Detalles (Nombre, Cantidad, Precio) */}
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800">{item.products.name}</p>
                  <p className="text-sm text-gray-500">
                    Cantidad: {item.quantity}
                  </p>
                  <p className="text-sm text-gray-500">
                    Precio unitario: ${item.price.toFixed(2)}
                  </p>
                </div>
                
                {/* Subtotal del Item */}
                <div className="text-right font-semibold text-gray-800">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </li>
            ))}
            
          </ul>
        </div>

        {/* Total del Pedido */}
        <div className='flex justify-end p-6 bg-gray-50 border-t border-gray-200'>
          <div className="text-right">
            {/* Puedes añadir más detalles si los tienes, como envío, etc. */}
            <div className="text-2xl font-bold text-gray-900">
              Total Pagado: ${order.total ? order.total.toFixed(2) : '0.00'}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
// frontend/src/pages/Product.jsx (Diseño Mejorado)

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useCart } from '../context/CartContext'

export default function Product() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true); // Añadimos estado de carga
  const { addToCart } = useCart()

  useEffect(() => {
    setLoading(true); // Inicia cargando
    async function load() {
      // Pedimos el producto y el nombre de su categoría
      const { data, error } = await supabase
        .from('products')
        .select(`
          *, 
          categories ( name ) 
        `)
        .eq('id', id)
        .single() // Solo esperamos un resultado
        
      if (error) {
        console.error("Error cargando producto:", error);
        setProduct(null); // Ponemos null si hay error
      } else {
        setProduct(data);
      }
      setLoading(false); // Termina de cargar
    }
    if (id) load()
  }, [id])

  // --- Renderizado Condicional ---
  if (loading) {
    return <div className="text-center p-10">Cargando producto...</div>
  }
  
  if (!product) {
    return <div className="text-center p-10 text-red-600">Error al cargar el producto o no encontrado.</div>
  }

  // --- Función para Añadir al Carrito ---
  const handleAddToCart = () => {
    addToCart(product);
  }

  // --- JSX con Diseño ---
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Grid principal: 1 columna en móvil, 2 en pantallas medianas+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        
        {/* Columna Izquierda: Imagen */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-lg"> 
          {product.images && product.images.length > 0 && product.images[0] ? (
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover" // Cubre el contenedor
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Imagen no disponible
            </div>
          )}
        </div>

        {/* Columna Derecha: Detalles y Compra */}
        <div className="flex flex-col h-full pt-4 md:pt-0"> {/* Flex column */}
          {/* Categoría (si existe) */}
          {product.categories?.name && (
            <span className="text-sm text-gray-500 mb-2 uppercase tracking-wide">{product.categories.name}</span>
          )}
          
          {/* Nombre del Producto */}
          <h1 className='text-3xl lg:text-4xl font-bold text-gray-800 mb-3'>{product.name}</h1>
          
          {/* Precio */}
          <p className='text-3xl font-semibold text-blue-700 mb-5'>${product.price}</p>
          
          {/* Descripción */}
          <div className="text-base text-gray-600 mb-6 prose lg:prose-lg"> {/* Usa 'prose' para mejor formato de texto */}
            <p>{product.description || "Descripción no disponible."}</p>
          </div>
          
          {/* Stock y Botón (usamos mt-auto para empujar al fondo) */}
          <div className="mt-auto pt-6 border-t border-gray-200"> 
            <p className='text-sm text-gray-500 mb-4'>Disponibles: {product.stock > 0 ? product.stock : 'Agotado'}</p>
            
            <button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0} // Deshabilitado si no hay stock
              className='w-full px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed'
            >
              {product.stock > 0 ? 'Añadir al Carrito' : 'Producto Agotado'}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  )
}
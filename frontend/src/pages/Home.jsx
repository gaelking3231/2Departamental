// frontend/src/pages/Home.jsx (100% Corregido)

import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Link } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, []) 

  useEffect(() => {
    const timerId = setTimeout(() => {
      loadProducts()
    }, 300) 

    return () => {
      clearTimeout(timerId)
    }
  }, [searchTerm, selectedCategoryId])

  async function loadCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      
    if (error) {
      console.error("Error cargando categorías:", error)
    } else {
      setCategories(data || [])
    }
  }

  async function loadProducts() {
    setLoading(true)
    
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .limit(20)

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    }
    
    if (selectedCategoryId) {
      query = query.eq('category_id', selectedCategoryId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error loading products:", error)
      setProducts([])
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* === HERO / BANNER (Corregido) === */}
      <section 
        className="relative bg-gradient-to-r from-gray-800 to-gray-900 text-white py-24 md:py-32 flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1920&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center max-w-3xl px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            Descubre la Nueva Colección
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Encuentra la tecnología y el estilo que definen tu mundo.
          </p>
          <button className="bg-white text-gray-900 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-300 text-lg hover:scale-105 transform">
            Ver Todos los Productos
          </button>
        </div>
      </section>

      {/* === SECCIÓN DE PRODUCTOS === */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className='text-3xl font-bold mb-8 text-gray-800'>Nuestros Productos</h1>

        {/* --- Filtros (Sin cambios) --- */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
          
          <div className="relative flex-grow w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select 
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-auto w-full bg-white"
          >
            <option value="">Todas las Categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
        </div>

        {/* --- Contenedor de Productos --- */}
        {loading ? (
          <div className="text-center p-6 text-gray-500">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            {searchTerm || selectedCategoryId
              ? `No se encontraron productos para tus filtros.`
              : "No hay productos disponibles."}
          </div>
        ) : (
          
          // --- Grid con Tarjetas (¡CÓDIGO 100% CORREGIDO!) ---
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {products.map(p => (
              <article key={p.id} className='border border-gray-200 rounded-lg overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-xl bg-white flex flex-col'>
                
                <Link to={`/product/${p.id}`} className='block h-48 sm:h-56 bg-gray-100 overflow-hidden'>
                  {p.images && p.images.length > 0 && p.images[0] ? (
                    <img 
                      src={p.images[0]} 
                      alt={p.name} 
                      className='w-full h-full object-cover transform hover:scale-105 transition-transform duration-300'
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      Sin imagen
                    </div>
                  )}
                </Link>

                <div className='p-4 flex flex-col flex-grow'>
                  <h2 className='text-lg font-semibold text-gray-800 mb-1 truncate'>{p.name}</h2>
                  {p.description && (
                    <p className='text-sm text-gray-600 mb-3 line-clamp-2 flex-grow'>{p.description}</p>
                  )}
                  <div className='mt-auto flex justify-between items-center pt-2 border-t border-gray-100'>
                    <p className='font-bold text-xl text-gray-900'>${p.price}</p>
                    <Link 
                      to={`/product/${p.id}`} 
                      className='text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1'
                    >
                      Ver Detalles
                      {/* Ícono de flecha (Corregido) */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
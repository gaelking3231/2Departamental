// frontend/src/pages/Admin.jsx (COMPLETO Y CORREGIDO)

import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
// Importamos iconos para los encabezados de las tarjetas
import { FiBox, FiTag, FiList } from 'react-icons/fi'

export default function Admin() {
  // --- Estados de Productos (SIN CAMBIOS) ---
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    name: '', description: '', price: 0, stock: 0, category_id: '', is_active: true, images: []
  })
  const [editingId, setEditingId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  // --- Estados de Categorías (SIN CAMBIOS) ---
  const [categories, setCategories] = useState([])
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' })
  const [editingCategoryId, setEditingCategoryId] = useState(null)

  // --- Cargar Datos (Read) ---
  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  async function fetchCategories() { /* ... (sin cambios) ... */
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true })
    if (error) console.error('Error fetching categories:', error)
    else setCategories(data)
  }
  async function fetchProducts() { /* ... (sin cambios) ... */
    const { data, error } = await supabase
      .from('products')
      .select(`*, categories ( id, name )`)
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching products:', error)
    else setProducts(data)
  }

  // ======================================================
  // --- AQUÍ ESTÁ TODA TU LÓGICA (AHORA SÍ INCLUIDA) ---
  // ======================================================

  const handleFormChange = (e) => { /* ... (sin cambios) ... */
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.category_id) {
      alert('Nombre y Categoría son campos obligatorios.')
      return
    }

    setUploading(true)

    let imageURLs = formData.images || []

    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${formData.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, selectedFile)

      if (uploadError) {
        alert('Error subiendo la imagen: ' + uploadError.message)
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)
      
      imageURLs = [urlData.publicUrl] 
    }

    const productToSave = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      stock: formData.stock,
      category_id: formData.category_id,
      is_active: formData.is_active,
      images: imageURLs
    }
    
    let error = null
    let updatedProductData = null
    if (editingId) {
      const { data, error: updateError } = await supabase.from('products').update(productToSave).eq('id', editingId).select(`*, categories ( id, name )`)
      error = updateError
      if (data) updatedProductData = data[0]
    } else {
      const { data, error: insertError } = await supabase.from('products').insert([productToSave]).select(`*, categories ( id, name )`)
      error = insertError
      if (data) updatedProductData = data[0]
    }

    setUploading(false)

    if (error) {
      alert('Error guardando el producto: ' + error.message)
      console.error('Error saving product:', error) 
    } else if (updatedProductData) {
      if (editingId) {
        alert('¡Producto actualizado!')
        setProducts(prev => prev.map(p => (p.id === editingId ? updatedProductData : p)))
      } else {
        alert('¡Producto creado!')
        setProducts(prev => [updatedProductData, ...prev])
      }
      resetForm()
    }
  }

  const handleEditClick = (product) => {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category_id: product.categories?.id || product.category_id,
      is_active: product.is_active,
      images: product.images || []
    })
    setSelectedFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({ 
      name: '', description: '', price: 0, stock: 0, category_id: '', is_active: true, 
      images: []
    })
    setSelectedFile(null) 
    const fileInput = document.getElementById('productImageFile');
    if (fileInput) fileInput.value = '';
  }

  const handleDelete = async (productId) => {
     if (!window.confirm('¿Estás seguro de que quieres borrar este producto?')) return
     
     const productToDelete = products.find(p => p.id === productId);
     if (productToDelete && productToDelete.images && productToDelete.images.length > 0) {
       const imageUrlToDelete = productToDelete.images[0];
       const fileName = imageUrlToDelete.split('/').pop();
       await supabase.storage.from('product-images').remove([fileName]);
     }
     
     const { error } = await supabase.from('products').delete().match({ id: productId })
     if (error) alert('Error al borrar el producto: ' + error.message)
     else {
       alert('¡Producto borrado!')
       setProducts(prevProducts => prevProducts.filter(p => p.id !== productId))
     }
  }

  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target
    setCategoryFormData(prev => ({ ...prev, [name]: value }))
  }
  const resetCategoryForm = () => {
    setEditingCategoryId(null)
    setCategoryFormData({ name: '', description: '' })
  }
  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    if (!categoryFormData.name) { alert('El nombre de la categoría es obligatorio.'); return }
    let error = null, updatedCategoryData = null
    if (editingCategoryId) {
      const { data, error: updateError } = await supabase.from('categories').update(categoryFormData).eq('id', editingCategoryId).select()
      error = updateError; if (data) updatedCategoryData = data[0]
    } else {
      const { data, error: insertError } = await supabase.from('categories').insert([categoryFormData]).select()
      error = insertError; if (data) updatedCategoryData = data[0]
    }
    if (error) alert('Error guardando la categoría: ' + error.message)
    else if (updatedCategoryData) {
      if (editingCategoryId) {
        alert('¡Categoría actualizada!')
        setCategories(prev => prev.map(c => (c.id === editingCategoryId ? updatedCategoryData : c)))
      } else {
        alert('¡Categoría creada!')
        setCategories(prev => [...prev, updatedCategoryData])
      }
      resetCategoryForm()
    }
  }
  const handleCategoryEditClick = (category) => {
    setEditingCategoryId(category.id)
    setCategoryFormData({ name: category.name, description: category.description || '' })
  }
  const handleCategoryDelete = async (categoryId) => {
    if (!window.confirm('¿Seguro que quieres borrar esta categoría?')) return
    const { error } = await supabase.from('categories').delete().eq('id', categoryId)
    if (error) alert('Error al borrar la categoría: ' + error.message)
    else {
      alert('¡Categoría borrada!')
      setCategories(prev => prev.filter(c => c.id !== categoryId))
      fetchProducts()
    }
  }

  // =============================================
  // --- RENDERIZADO DEL COMPONENTE (DISEÑO MEJORADO) ---
  // =============================================
  return (
    <div className="max-w-7xl mx-auto my-8 px-4">
      <h1 className='text-3xl font-bold mb-6 text-gray-900'>Panel de Administración</h1>

      <div className="space-y-8">

        {/* --- 1. Tarjeta: CRUD DE PRODUCTOS --- */}
        <section className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <form onSubmit={handleFormSubmit}>
            <div className="flex items-center gap-3 p-6 bg-gray-50 border-b border-gray-200">
              <FiBox className="w-6 h-6 text-gray-600" />
              <h2 className='text-xl font-semibold text-gray-800'>
                {editingId ? 'Editando Producto' : 'Crear Nuevo Producto'}
              </h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className='block text-sm font-medium mb-1 text-gray-700'>Nombre:</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required 
                  className='w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500' />
              </div>
              
              <div>
                <label className='block text-sm font-medium mb-1 text-gray-700'>Categoría:</label>
                <select name="category_id" value={formData.category_id} onChange={handleFormChange} required 
                  className='w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'>
                  <option value="" disabled>-- Selecciona --</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium mb-1 text-gray-700'>Descripción:</label>
                <textarea name="description" value={formData.description} onChange={handleFormChange} rows="3"
                  className='w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500' />
              </div>

              <div>
                <label className='block text-sm font-medium mb-1 text-gray-700'>Precio ($):</label>
                <input type="number" name="price" value={formData.price} onChange={handleFormChange} min="0" step="0.01"
                  className='w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500' />
              </div>
              
              <div>
                <label className='block text-sm font-medium mb-1 text-gray-700'>Stock:</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleFormChange} min="0"
                  className='w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500' />
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium mb-1 text-gray-700'>Imagen del Producto:</label>
                {editingId && formData.images && formData.images.length > 0 && (
                  <img src={formData.images[0]} alt="Imagen actual" className='h-20 w-auto mb-2 rounded object-cover border border-gray-200 p-1' />
                )}
                <input type="file" id="productImageFile" accept="image/*" onChange={handleFileChange} 
                  className='w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'/>
                {selectedFile && <p className='text-xs mt-1 text-gray-500'>Nuevo archivo: {selectedFile.name}</p>}
              </div>

              <div className='md:col-span-2 flex items-center gap-2'>
                <input type="checkbox" name="is_active" id="is_active_check" checked={formData.is_active} onChange={handleFormChange} 
                  className='h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300'/>
                <label htmlFor="is_active_check" className='text-sm font-medium text-gray-700'>Activo</label>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center gap-4">
              <button type="submit" disabled={uploading} 
                className='px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors disabled:bg-gray-400'>
                {uploading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Crear Producto')}
              </button>
              {editingId && !uploading && (
                <button type="button" onClick={resetForm} 
                  className='px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow hover:bg-gray-700 transition-colors'>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* --- 2. Tarjeta: CRUD DE CATEGORÍAS --- */}
        <section className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <div className="flex items-center gap-3 p-6 bg-gray-50 border-b border-gray-200">
            <FiTag className="w-6 h-6 text-gray-600" />
            <h2 className='text-xl font-semibold text-gray-800'>Administrar Categorías</h2>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-700'>
                {editingCategoryId ? 'Editando Categoría' : 'Crear Nueva Categoría'}
              </h3>
              <form onSubmit={handleCategorySubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-1 text-gray-700'>Nombre:</label>
                  <input type="text" name="name" value={categoryFormData.name} onChange={handleCategoryFormChange} required 
                    className='w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500' />
                </div>
                <div>
                  <label className='block text-sm font-medium mb-1 text-gray-700'>Descripción (Opcional):</label>
                  <textarea name="description" value={categoryFormData.description} onChange={handleCategoryFormChange} rows="2"
                    className='w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500' />
                </div>
                <div className='flex items-center gap-4 pt-2'>
                  <button type="submit" 
                    className='px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors'>
                    {editingCategoryId ? 'Guardar Cambios' : 'Crear Categoría'}
                  </button>
                  {editingCategoryId && (
                    <button type="button" onClick={resetCategoryForm} 
                      className='px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow hover:bg-gray-700 transition-colors'>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            <div className='overflow-x-auto border border-gray-200 rounded-lg max-h-96 overflow-y-auto'>
              <table className='min-w-full bg-white'>
                <thead className='bg-gray-100 sticky top-0'>
                  <tr>
                    <th className='p-3 text-left text-sm font-semibold text-gray-700 border-b'>Nombre</th>
                    <th className='p-3 text-left text-sm font-semibold text-gray-700 border-b'>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id} className='hover:bg-gray-50'>
                      <td className='p-3 text-sm text-gray-800 border-t'>{cat.name}</td>
                      <td className='p-3 text-sm text-gray-600 border-t'>
                        <button onClick={() => handleCategoryEditClick(cat)} className='mr-2 text-sm text-blue-600 hover:underline'>Editar</button>
                        <button onClick={() => handleCategoryDelete(cat.id)} className='text-sm text-red-600 hover:underline'>Borrar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* --- 3. Tarjeta: TABLA DE PRODUCTOS --- */}
        <section className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <div className="flex items-center gap-3 p-6 bg-gray-50 border-b border-gray-200">
            <FiList className="w-6 h-6 text-gray-600" />
            <h2 className='text-xl font-semibold text-gray-800'>Productos Existentes</h2>
          </div>
          
          <div className='overflow-x-auto'>
            <table className='min-w-full'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className='p-3 text-left text-sm font-semibold text-gray-700 border-b'>Nombre</th>
                  <th className='p-3 text-left text-sm font-semibold text-gray-700 border-b'>Categoría</th>
                  <th className='p-3 text-left text-sm font-semibold text-gray-700 border-b'>Precio</th>
                  <th className='p-3 text-left text-sm font-semibold text-gray-700 border-b'>Stock</th>
                  <th className='p-3 text-left text-sm font-semibold text-gray-700 border-b'>Activo</th>
                  <th className='p-3 text-left text-sm font-semibold text-gray-700 border-b'>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className='hover:bg-gray-50'>
                    <td className='p-3 text-sm text-gray-800 border-t'>{product.name}</td>
                    <td className='p-3 text-sm text-gray-600 border-t'>{product.categories?.name || 'N/A'}</td>
                    <td className='p-3 text-sm text-gray-600 border-t'>${product.price}</td>
                    <td className='p-3 text-sm text-gray-600 border-t'>{product.stock}</td>
                    <td className='p-3 text-sm text-gray-600 border-t'>
                      {product.is_active ? 
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Sí</span> : 
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">No</span>
                      }
                    </td>
                    <td className='p-3 text-sm text-gray-600 border-t'>
                      <button onClick={() => handleEditClick(product)} className='mr-2 text-sm text-blue-600 hover:underline'>Editar</button>
                      <button onClick={() => handleDelete(product.id)} className='text-sm text-red-600 hover:underline'>Borrar</button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
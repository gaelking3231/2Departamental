// frontend/src/pages/Profile.jsx (Diseño Mejorado)

import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { FiUser, FiLock } from 'react-icons/fi' // Importamos iconos

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  
  // Estado para el formulario de perfil (tu código original)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  })

  // --- NUEVO ESTADO: para el formulario de contraseña ---
  const [newPassword, setNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // --- fetchUserProfile (tu código original, SIN CAMBIOS) ---
  useEffect(() => {
    fetchUserProfile()
  }, [])

  async function fetchUserProfile() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setUser(user)
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setFormData({
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
        })
      }
      if (error) {
        console.error("Error cargando el perfil:", error.message)
      }
    }
    setLoading(false)
  }

  // --- handleInputChange (tu código original, SIN CAMBIOS) ---
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // --- handleSubmit (para Perfil) (tu código original, SIN CAMBIOS) ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
      })
      .eq('id', user.id)

    if (error) {
      alert('Error al actualizar el perfil: ' + error.message)
    } else {
      alert('¡Perfil actualizado con éxito!')
    }
    setLoading(false)
  }

  // --- NUEVA FUNCIÓN: para actualizar la contraseña ---
  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setPasswordLoading(true)
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      alert('Error al actualizar la contraseña: ' + error.message)
    } else {
      alert('¡Contraseña actualizada con éxito!')
      setNewPassword('') // Limpiamos el input
    }
    setPasswordLoading(false)
  }

  // --- Vistas de Carga / No Usuario (SIN CAMBIOS) ---
  if (loading && !user) { // Unimos la carga inicial
    return <div className='p-4 text-center'>Cargando perfil...</div>
  }

  if (!user) {
    return <div className='p-4 text-center'>Debes iniciar sesión para ver tu perfil.</div>
  }

  // --- RENDERIZADO (NUEVO DISEÑO DE TARJETAS) ---
  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">Mi Perfil</h1>
      <p className='mb-6 text-gray-600'>Email: {user.email} (no se puede cambiar)</p>

      {/* Usamos 'space-y-8' para separar las tarjetas */}
      <div className="space-y-8">

        {/* === Tarjeta 1: Información Personal (Tu formulario) === */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <form onSubmit={handleSubmit}>
            {/* Encabezado de la Tarjeta */}
            <div className="flex items-center gap-3 p-6 bg-gray-50 border-b border-gray-200">
              <FiUser className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-800">Información Personal</h2>
            </div>

            {/* Cuerpo del Formulario */}
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor='full_name' className='block text-sm font-medium mb-1 text-gray-700'>Nombre Completo:</label>
                <input
                  type='text'
                  id='full_name'
                  name='full_name'
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Ej. Juan Pérez"
                  className='w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label htmlFor='phone' className='block text-sm font-medium mb-1 text-gray-700'>Teléfono:</label>
                <input
                  type='tel'
                  id='phone'
                  name='phone'
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Ej. 55 1234 5678"
                  className='w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>

            {/* Pie de Página del Formulario (con el botón) */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 text-right">
              <button 
                type='submit' 
                disabled={loading}
                className='px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors disabled:bg-gray-400'
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>

        {/* === Tarjeta 2: Cambiar Contraseña (NUEVA) === */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <form onSubmit={handlePasswordUpdate}>
            {/* Encabezado */}
            <div className="flex items-center gap-3 p-6 bg-gray-50 border-b border-gray-200">
              <FiLock className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-800">Seguridad y Contraseña</h2>
            </div>

            {/* Cuerpo */}
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor='newPassword' className='block text-sm font-medium mb-1 text-gray-700'>Nueva Contraseña:</label>
                <input
                  type='password'
                  id='newPassword'
                  name='newPassword'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className='w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
                <p className="text-xs text-gray-500 mt-2">Tu contraseña debe tener al menos 6 caracteres.</p>
              </div>
            </div>
            
            {/* Pie de Página */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 text-right">
              <button 
                type='submit' 
                disabled={passwordLoading}
                // Usamos otro color para diferenciar la acción
                className='px-6 py-2 bg-gray-800 text-white font-semibold rounded-lg shadow hover:bg-gray-700 transition-colors disabled:bg-gray-400'
              >
                {passwordLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </div>
          </form>
        </div>
        
      </div>
    </div>
  )
}
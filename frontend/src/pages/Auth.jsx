// frontend/src/pages/Auth.jsx (Diseño "Vergas" 🤘)

import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
// Importamos los iconos para los botones sociales
import { FaGoogle, FaGithub } from 'react-icons/fa'

export default function Auth() {
  // Estado para saber si estamos en 'Ingresar' o 'Crear Cuenta'
  const [mode, setMode] = useState('signIn') // 'signIn' o 'signUp'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false) // Estado de carga para los botones
  const navigate = useNavigate()

  // --- Tu función signUp (actualizada con loading) ---
  async function signUp() {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        alert(error.message)
      } else {
        alert('Revisa tu correo para verificar la cuenta.')
        setMode('signIn') // Regresamos al login después de registrarse
      }
    } catch (error) {
      alert(error.message)
    }
    setLoading(false)
  }

  // --- Tu función signIn (actualizada con loading) ---
  async function signIn() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert(error.message)
    } else {
      // El 'alert' de 'Ingresado' no es necesario, solo redirigimos
      navigate('/')
    }
    setLoading(false)
  }

  // --- NUEVA: Función para manejar el submit del formulario ---
  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === 'signIn') {
      signIn()
    } else {
      signUp()
    }
  }

  // --- NUEVA: Función para inicio de sesión social (OAuth) ---
  async function handleOAuth(provider) {
    // No se necesita 'loading' aquí porque redirige la página
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider, // 'google', 'github', etc.
    })
    if (error) {
      alert(error.message)
    }
  }

  // Clases de Tailwind para las pestañas
  const activeTabClass = 'w-1/2 py-3 font-semibold text-center text-white bg-blue-600 rounded-t-lg transition-colors'
  const inactiveTabClass = 'w-1/2 py-3 font-semibold text-center text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-t-lg transition-colors'

  return (
    // Contenedor principal para centrar la tarjeta
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-200">
        
        {/* --- 1. Pestañas (Tabs) --- */}
        <div className="flex">
          <button
            onClick={() => setMode('signIn')}
            className={mode === 'signIn' ? activeTabClass : inactiveTabClass}
          >
            Ingresar
          </button>
          <button
            onClick={() => setMode('signUp')}
            className={mode === 'signUp' ? activeTabClass : inactiveTabClass}
          >
            Crear Cuenta
          </button>
        </div>

        <div className="p-8">
          {/* --- 2. Formulario Principal --- */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email:
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña:
              </label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Cargando...' : (mode === 'signIn' ? 'Ingresar' : 'Crear Cuenta')}
            </button>
          </form>

          {/* --- 3. Divisor "O continúa con" --- */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300"></span>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O continúa con</span>
            </div>
          </div>

          {/* --- 4. Botones de Inicio de Sesión Social --- */}
          <div className="space-y-3">
            <button
              onClick={() => handleOAuth('google')}
              className="w-full flex justify-center items-center gap-3 py-3 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              <FaGoogle className="w-5 h-5" />
              Ingresar con Google
            </button>
            <button
              onClick={() => handleOAuth('github')}
              className="w-full flex justify-center items-center gap-3 py-3 border border-gray-800 bg-gray-800 text-white rounded-lg shadow-sm hover:bg-gray-700 transition-colors font-medium"
            >
              <FaGithub className="w-5 h-5" />
              Ingresar con GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
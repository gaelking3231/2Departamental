// frontend/src/App.jsx (Con la nueva ruta de OrderDetail)

import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useCart } from './context/CartContext'

// Importamos los iconos
import { 
  FiShoppingCart, 
  FiUser, 
  FiList, 
  FiShield, 
  FiLogIn, 
  FiLogOut 
} from 'react-icons/fi'

// Páginas
import Home from './pages/Home'
import Product from './pages/Product'
import Admin from './pages/Admin'
import Auth from './pages/Auth'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail' // <-- 1. NUEVA LÍNEA: Importa la página
import Profile from './pages/Profile'
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

// --- Componente de Ruta Protegida para Admin (SIN CAMBIOS) ---
const AdminRoute = ({ session, children }) => {
  const isAdmin = session?.user?.app_metadata?.role === 'admin'
  if (!session || !isAdmin) {
    return <Navigate to="/" replace />
  }
  return children
}

// --- Protector de Ruta (SIN CAMBIOS) ---
const ProtectedRoute = ({ session, children }) => {
  if (!session) {
    return <Navigate to="/auth" replace />
  }
  return children
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const { cartItems } = useCart()

  // Lógica de conteo del carrito (SIN CAMBIOS)
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  // Lógica de Sesión (SIN CAMBIOS)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      console.log("Sesión obtenida (getSession):", session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      console.log("Sesión actualizada (onAuthChange):", session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Lógica de Logout (SIN CAMBIOS)
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return <div className='p-4 text-center'>Cargando sesión...</div>
  }

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className='min-h-screen bg-gray-50'>
      
      {/* === NAVBAR (SIN CAMBIOS) === */}
      <nav className="w-full bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <Link to='/' className='text-2xl font-bold text-gray-900'>Tienda</Link>
            
            <div className="flex items-center space-x-6">

              <Link 
                to='/cart' 
                className='relative flex items-center space-x-1.5 text-gray-600 hover:text-gray-900 font-medium text-sm no-underline bg-gray-100 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors'
              >
                <FiShoppingCart className="w-5 h-5" />
                <span>Carrito</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              
              {session?.user?.app_metadata?.role === 'admin' && (
                <Link to='/admin' className='flex items-center space-x-1.5 text-gray-600 hover:text-gray-900 font-medium text-sm'>
                  <FiShield className="w-5 h-5" />
                  <span>Admin</span>
                </Link>
              )}

              {session && (
                <>
                  <Link to='/profile' className='flex items-center space-x-1.5 text-gray-600 hover:text-gray-900 font-medium text-sm'>
                    <FiUser className="w-5 h-5" />
                    <span>Mi Perfil</span>
                  </Link>
                  <Link to='/orders' className='flex items-center space-x-1.5 text-gray-600 hover:text-gray-900 font-medium text-sm'>
                    <FiList className="w-5 h-5" />
                    <span>Mis Pedidos</span>
                  </Link>
                </>
              )}
              
              {session && <div className="w-px h-6 bg-gray-300"></div>}

              {session ? (
                <button 
                  onClick={handleLogout} 
                  className='flex items-center space-x-1.5 text-red-600 hover:text-red-800 font-medium text-sm'
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link to='/auth' className='flex items-center space-x-1.5 text-gray-600 hover:text-gray-900 font-medium text-sm'>
                  <FiLogIn className="w-5 h-5" />
                  <span>Login</span>
                </Link>
              )}

            </div>
          </div>
        </div>
      </nav>
      
      {/* === CONTENIDO PRINCIPAL (RUTAS) === */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route 
            path="/admin" 
            element={
              <AdminRoute session={session}>
                <Admin />
              </AdminRoute>
            } 
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="/cart" element={<Cart />} />
          
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute session={session}>
                <Orders />
              </ProtectedRoute>
            } 
          />
          
          {/* === 2. NUEVA LÍNEA: La ruta para el detalle del pedido === */}
          <Route 
            path="/orders/:id" 
            element={
              <ProtectedRoute session={session}>
                <OrderDetail />
              </ProtectedRoute>
            } 
          />
          {/* ====================================================== */}
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute session={session}>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />

        </Routes> 
      </main>
    </div>
  )
}
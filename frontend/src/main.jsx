// frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css' // O index.css
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Verifica que esta clave se imprima correctamente en la consola
console.log("Clave Publicable de Stripe:", import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY); 
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY); 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        {/* --- ¡ASEGÚRATE DE QUE ESTO ESTÉ ASÍ! --- */}
        <Elements stripe={stripePromise}> 
          <App />
        </Elements>
        {/* --------------------------------------- */}
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
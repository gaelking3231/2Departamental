// frontend/src/pages/PaymentCancel.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function PaymentCancel() {
  return (
    <div className="text-center p-8">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Pago Cancelado</h1>
      <p className="text-lg mb-6">Tu pago no se completó. Puedes volver a intentarlo desde tu carrito.</p>
      <Link 
        to="/cart" 
        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors mr-4"
      >
        Volver al Carrito
      </Link>
      <Link 
        to="/" 
        className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        Ir a la Tienda
      </Link>
    </div>
  );
}
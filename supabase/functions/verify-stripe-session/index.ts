// supabase/functions/verify-stripe-session/index.ts
import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@15.8.0?target=deno&deno-std=0.203.0'
import { corsHeaders } from '../_shared/cors.ts' // Importa cabeceras CORS

// Inicializa Stripe con tu clave secreta
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-11-15',
})

serve(async (req) => {
  // --- MANEJO CORS PRIMERO ---
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders }) // Devuelve cabeceras CORS para OPTIONS
  }
  // -----------------------------

  try {
    // 1. Extrae el session_id
    const { session_id } = await req.json()
    if (!session_id) {
      throw new Error("Falta el 'session_id'.")
    }

    console.log(`Verificando Stripe session ID: ${session_id}`); // Log

    // 2. Pide detalles a Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
       expand: ['line_items.data.price.product'], 
    });

    console.log("Respuesta de Stripe retrieve:", session); // Log

    // 3. Verifica si el pago fue exitoso
    if (session.payment_status !== 'paid') {
      throw new Error(`El pago para la sesión ${session_id} no fue exitoso (${session.payment_status}).`)
    }

    // 4. Extrae detalles (opcional pero útil)
    const lineItems = session.line_items?.data || [];
    const orderDetails = {
       sessionId: session.id,
       paymentStatus: session.payment_status,
       customerEmail: session.customer_details?.email, 
       totalAmount: session.amount_total ? session.amount_total / 100 : 0,
       items: lineItems.map(item => {
         const product = item.price?.product as Stripe.Product; 
         return {
           name: product?.name || item.description, 
           quantity: item.quantity,
           pricePerUnit: item.price?.unit_amount ? item.price.unit_amount / 100 : 0, 
         }
       }),
    }

    // 5. Devuelve éxito y detalles
    return new Response(JSON.stringify({ success: true, orderDetails: orderDetails }), {
      // INCLUYE CORS HEADERS EN LA RESPUESTA
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 200,
    })

  } catch (error) {
    console.error('Error verificando sesión de Stripe:', error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      // INCLUYE CORS HEADERS EN EL ERROR
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 400,
    })
  }
})
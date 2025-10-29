// supabase/functions/create-checkout-session/index.ts

import { serve } from 'https://deno.land/std@0.203.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@15.8.0?target=deno&deno-std=0.203.0'
import { corsHeaders } from '../_shared/cors.ts'
// ¡Importante! Necesitamos el cliente de Supabase para llamar a la DB
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4'

// Inicializa Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-11-15',
})

serve(async (req) => {
  // Manejo de preflight request (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. OBTENER LOS DATOS DEL CARRITO Y EL USUARIO
    // Esta función SÍ espera 'cartItems', no 'session_id'
    const { cartItems } = await req.json()
    if (!cartItems || cartItems.length === 0) {
      throw new Error("No hay ítems en el carrito.")
    }
    
    // --- OBTENER EL USUARIO DE SUPABASE ---
    // Creamos un cliente de Supabase con permisos de 'service_role'
    // para poder crear pedidos y actualizar stock.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Obtenemos el usuario a partir del token de autorización
    const authHeader = req.headers.get('Authorization')!
    const { data: { user } } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (!user) {
      throw new Error("Usuario no autenticado.")
    }

    // 2. FORMATEAR LOS DATOS PARA STRIPE
    const line_items = cartItems.map(item => ({
      price_data: {
        currency: 'usd', // O 'mxn' si así lo configuraste
        product_data: {
          name: item.name,
          images: item.images && item.images.length > 0 ? [item.images[0]] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convertir a centavos
      },
      quantity: item.quantity,
    }))
    
    // 3. (OPCIONAL PERO RECOMENDADO) CREAR EL PEDIDO EN TU DB *ANTES* DE COBRAR
    // Así guardas el pedido como 'pending'
    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        total: total,
        status: 'pending', // El pedido se crea como pendiente
      })
      .select('id')
      .single()

    if (orderError) {
      console.error('Error creando pedido:', orderError)
      throw new Error("No se pudo guardar el pedido en la base de datos.")
    }
    
    const orderId = orderData.id

    // 4. GUARDAR LOS ITEMS DEL PEDIDO
    const orderItemsData = cartItems.map(item => ({
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsData)

    if (itemsError) {
      console.error('Error creando items del pedido:', itemsError)
      throw new Error("No se pudo guardar los items del pedido.")
    }

    // ======================================================
    // === 5. ¡AQUÍ VA LA LÓGICA DE ACTUALIZAR EL STOCK! ===
    // ======================================================
    
    // Preparamos los datos (solo id y quantity)
    const stockUpdateData = cartItems.map(item => ({
      id: item.id,
      quantity: item.quantity
    }));
    
    // Llamamos a la función RPC 'decrement_stock' que creaste en el SQL Editor
    const { error: rpcError } = await supabaseAdmin.rpc('decrement_stock', {
      items: stockUpdateData
    });

    if (rpcError) {
      console.error('Error fatal al actualizar stock:', rpcError);
      // Detenemos el proceso si el stock no se pudo actualizar
      throw new Error("No se pudo actualizar el stock de los productos.");
    }

    // ======================================================
    // === FIN DEL BLOQUE DE STOCK ===
    // ======================================================
    
    // 6. CREAR LA SESIÓN DE CHECKOUT EN STRIPE
    // Este código usa 'sessions.create()', que es lo correcto
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      // ¡Importante! Pasa el ID de tu pedido a las páginas de éxito/cancelación
      success_url: `${Deno.env.get('SITE_URL')}/payment-success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${Deno.env.get('SITE_URL')}/payment-cancel?order_id=${orderId}`,
      // (Opcional) Guardar el ID de pedido en los metadatos de Stripe
      metadata: {
        order_id: orderId,
      },
    })

    // 7. DEVOLVER LA URL DE LA SESIÓN AL FRONTEND
    return new Response(JSON.stringify({ sessionUrl: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error en create-checkout-session:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
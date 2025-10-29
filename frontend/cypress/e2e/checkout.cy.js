// cypress/e2e/checkout.cy.js

describe('Flujo de Compra E2E', () => {
  // Define variables para las credenciales
  const userEmail = 'cliente4@tutienda.com';
  const userPassword = '12345678'; // Contraseña corregida

  it('permite a un usuario iniciar sesión, añadir al carrito y proceder al checkout de Stripe', () => {
    
    // --- 1. LIMPIEZA Y PREPARACIÓN DE ESPÍAS ---
    // Limpiamos sesión y preparamos TODOS los espías ANTES de visitar
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();
    
    // Preparamos el "espía" para la carga de productos de Supabase
    cy.intercept('GET', '**/rest/v1/products?*').as('getProducts');
    // Preparamos el "espía" para la llamada a Stripe (aunque se use después)
    cy.intercept('POST', 'https://r.stripe.com/b*').as('stripeCall');
    // --- FIN PREPARACIÓN ---

    
    // --- 2. VISITAR HOME Y ESPERAR PRODUCTOS ---
    cy.visit('http://localhost:5173/');
    
    // Esperamos a que la página principal cargue sus productos
    cy.wait('@getProducts');
    // --- FIN VISITA HOME ---


    // --- 3. IR AL LOGIN (EL FLUJO CORRECTO) ---
    // Hacemos clic en "Login" para NAVEGAR a la página de login
    cy.contains('Login').click();
    
    // AHORA SÍ, verificamos que estamos en /auth
    cy.url().should('include', '/auth');
    // --- FIN IR AL LOGIN ---


    // --- 4. INICIAR SESIÓN ---
    cy.get('input[placeholder="tu@email.com"]').type(userEmail);
    cy.get('input[type="password"]').type(userPassword); 
    cy.get('form').submit(); // Usamos .submit()
    // --- FIN INICIAR SESIÓN ---


    // --- 5. VERIFICAR LOGIN Y REGRESO A HOME ---
    // Esperamos a que aparezca "Logout" (esto confirma la redirección)
    cy.contains('Logout'); 
    cy.url().should('eq', 'http://localhost:5173/');
    // --- FIN VERIFICACIÓN ---


    // --- 6. CONTINUAR CON LA COMPRA ---
    // (Ahora que estamos logueados y en el Home, clicamos el producto)
    cy.get('article a').first().click();
    cy.url().should('include', '/product/');

    // -------- ¡EL ERROR DE TU ÚLTIMA FOTO ESTÁ AQUÍ! --------
    // Añadir al carrito
    // Esta línea falla porque el texto del botón en tu página
    // NO ES "Añadir al Carrito".
    cy.contains('button', 'Añadir al Carrito').click();
    // -------- FIN DEL ERROR --------

    cy.wait('@stripeCall'); // Esperamos a Stripe
    cy.contains('a', 'Carrito').should('contain', '1');

    // Ir al Carrito
    cy.contains('a', 'Carrito').should('contain', '1').click();
    cy.url().should('include', '/cart');

    // Pagar
    cy.contains('button', 'Pagar con Tarjeta').click();

    // Verificar Stripe (Esto fallará si no arreglaste cypress.config.js)
    cy.origin('https://checkout.stripe.com', () => {
      cy.url().should('include', '/pay/cs_test_');
    });
    
  }); // <-- Cierre del "it"

}); // <-- Cierre del "describe"
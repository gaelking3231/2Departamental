# 🛒 Tienda E-Commerce (2do Departamental)

Proyecto de e-commerce completo que integra un frontend (React/Vite), autenticación y base de datos con Supabase, y pasarela de pagos con Stripe. Incluye una suite de pruebas End-to-End (E2E) con Cypress.

---

## 🔗 Enlace de Despliegue

* **Aplicación Desplegada:** 
* **Backend:** `https://hdnfuyrregwuhqzclnix.supabase.co` (Tu URL de Supabase)

---

## 🏛️ Arquitectura del Proyecto

El proyecto sigue una arquitectura moderna JAMstack:

* **Frontend:** **Vite (React)** - Un entorno de desarrollo frontend rápido y ligero. Desplegado en Vercel/Netlify.
* **Backend (BaaS):** **Supabase** - Se utiliza para:
    * **Autenticación:** Manejo de usuarios (Login, Registro).
    * **Base de Datos:** PostgreSQL para almacenar productos, perfiles y (opcionalmente) carritos.
    * **Políticas RLS:** Para seguridad a nivel de fila.
* **Pagos:** **Stripe** - Se usa para procesar los pagos de forma segura en modo de prueba.
* **Pruebas (Testing):** **Cypress** - Para pruebas E2E del flujo de compra completo.

---

## 🛠️ Configuración Local

Para correr este proyecto localmente, sigue estos pasos:

1.  **Clona el repositorio:**
    ```bash
    git clone [https://github.com/gaelking3231/2Departamental.git](https://github.com/gaelking3231/2Departamental.git)
    cd 2Departamental
    ```

2.  **Navega a la carpeta del frontend e instala dependencias:**
    ```bash
    cd frontend
    npm install
    ```

3.  **Configura las Variables de Entorno:**
    * Crea un archivo `.env` en la carpeta `frontend`.
    * Copia el contenido de `.env.example` y llénalo con tus propias llaves de Supabase y Stripe.

    **Variables de Entorno (`frontend/.env`):**
    ```env
    # Claves de Supabase (Públicas)
    VITE_SUPABASE_URL=httpsAtt://hdnfuyrregwuhqzclnix.supabase.co
    VITE_SUPABASE_ANON_KEY=[TU_LLAVE_ANON_VA_AQUI]

    # Claves de Stripe (Públicas)
    VITE_STRIPE_PUBLIC_KEY=[TU_LLAVE_PUBLICA_DE_STRIPE_VA_AQUI]
    ```

4.  **Corre el proyecto:**
    ```bash
    npm run dev
    ```

---

## 👨‍💻 Roles y Usuarios de Prueba

El sistema maneja dos roles principales definidos por Supabase:

* **`anon` (Anónimo):** Usuarios no autenticados. La app los redirige a la pantalla de Login.
* **`authenticated` (Autenticado):** Usuarios con sesión iniciada. Pueden ver productos, gestionar su carrito y realizar compras.

**Usuarios de Prueba:**

| Email | Contraseña | Rol |
| :--- | :--- | :--- |
| `cliente4@tutienda.com` | `12345678` | `authenticated` |

---

## 🧪 Pruebas (Testing E2E con Cypress)

El proyecto incluye una suite de pruebas E2E que valida el flujo de compra completo.

**Para ejecutar las pruebas:**

1.  Asegúrate de que el proyecto esté corriendo (`npm run dev`).
2.  En una nueva terminal (en la carpeta `frontend`), corre Cypress:
    ```bash
    npx cypress open
    ```
3.  En el Cypress Test Runner, haz clic en `checkout.cy.js` para ejecutar la prueba.

**El flujo que valida la prueba es:**
1.  Visita la página y es redirigido a `/auth`.
2.  Inicia sesión con un usuario de prueba.
3.  Espera a ser redirigido al Home y a que carguen los productos de Supabase.
4.  Hace clic en un producto.
5.  Añade el producto al carrito y espera la respuesta de Stripe.
6.  Verifica que el contador del carrito se actualiza.
7.  Navega al carrito y procede al pago.
8.  Verifica que se redirige exitosamente a la página de pago de Stripe.

---

## 📊 ERD (Diagrama Entidad-Relación)

*Diagrama generado desde el "Schema Visualizer" de Supabase.*

![ERD del Proyecto]![ERD](https://github.com/user-attachments/assets/4da1ae70-c4dd-4c90-a22c-494ac0b4ae9b)
()

---

## 🔒 Políticas de RLS Documentadas

A continuación se detallan las políticas de seguridad a nivel de fila (RLS) implementadas en Supabase para cada tabla:

### Tabla: `products`
* **Política:** `Public can read active products`
* **Explicación:** Permite que *cualquier* usuario (anónimo o autenticado) pueda ver (SELECT) los productos que están marcados como activos. Esta es la política principal que permite a la gente ver el catálogo.
* **Extracto SQL (USING expression):** (Probablemente `(is_active = true)`)

* **Política:** `Admins can CRUD products`
* **Explicación:** Permite a los usuarios con el rol `admin` realizar cualquier operación (Crear, Leer, Actualizar, Borrar) en los productos.
* **Extracto SQL:** (Probablemente `(auth.role() = 'admin'::text)`)

### Tabla: `categories`
* **Política:** `Public can read categories`
* **Explicación:** Permite que cualquier usuario (anónimo o autenticado) pueda ver (SELECT) la lista de categorías.
* **Extracto SQL (USING expression):** `true`

* **Política:** `Admins can CRUD categories`
* **Explicación:** Permite a los usuarios `admin` gestionar las categorías.
* **Extracto SQL:** (Probablemente `(auth.role() = 'admin'::text)`)

### Tabla: `profiles`
* **Política:** `Users can select their own profile`
* **Explicación:** Política de seguridad clave. Asegura que un usuario autenticado solo pueda leer (SELECT) la fila de `profiles` que coincide con su propio ID.
* **Extracto SQL (USING expression):** `(auth.uid() = id)`

* **Política:** `Users can update their own profile`
* **Explicación:** Permite a un usuario actualizar (UPDATE) únicamente su propia fila de perfil.
* **Extracto SQL (WITH CHECK expression):** `(auth.uid() = id)`

* **Política:** `Users can insert their own profile`
* **Explicación:** Permite a un usuario recién registrado crear (INSERT) su propia fila de perfil.
* **Extracto SQL (WITH CHECK expression):** `(auth.uid() = id)`

* **Política:** (Y otras políticas de admin/borrado...)

### Tabla: `carts` y `cart_items`
* **Política:** `Allow owner to select, update, delete own cart` / `cart_items_owner`
* **Explicación:** Estas políticas aseguran que un usuario autenticado solo pueda ver, modificar o borrar *su propio* carrito y los artículos *dentro* de él. Evita que un usuario vea el carrito de otro.
* **Extracto SQL (USING / WITH CHECK):** (Probablemente `(auth.uid() = user_id)`)

### Tabla: `orders` y `order_items`
* **Política:** `orders_select_owner_or_admin` / `Los usuarios pueden ver los items de sus propios pedidos`
* **Explicación:** Políticas similares al carrito. Un usuario solo puede ver los pedidos (`orders`) y los artículos de pedido (`order_items`) que le pertenecen.
* **Extracto SQL (USING expression):** (Probablemente `(auth.uid() = user_id)`)

* **Política:** `orders_insert_owner` / `Users can insert items for their own orders`
* **Explicación:** Permite a un usuario crear (INSERT) nuevos pedidos y artículos de pedido para sí mismo (al completar una compra).
* **Extracto SQL (WITH CHECK expression):** (Probablemente `(auth.uid() = user_id)`)

### Tabla: `products`
* **Política:** "Permitir acceso de lectura (SELECT) a todos."
* **Explicación:** Cualquier usuario, esté o no autenticado, puede ver la lista de productos.
* **Código SQL (USING expression):** `true`

### Tabla: `profiles` (Ejemplo si la tienes)
* **Política:** "Permitir a los usuarios ver/actualizar su propio perfil."
* **Explicación:** Un usuario solo puede leer o escribir la fila que coincide con su `id` de autenticación.
* **Código SQL (USING / WITH CHECK):** `(auth.uid() = user_id)`

---

* **Migraciones:** Los scripts para crear la estructura de la base de datos se encuentran en la carpeta `/supabase/migrations`.
* **Semilla (Seed):** El script para poblar la base de datos con datos de prueba se encuentra en `/supabase/seed.sql`.

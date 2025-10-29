Frontend (Vite + React + Tailwind)

Comandos:
- npm install
- npm run dev

Estructura principal:
- src/
  - pages/
  - components/
  - supabaseClient.js

Notas:
- Rutas protegidas y manejo de roles deben implementarse usando `supabase.auth.getSession()` y verificando `user` y `user.user_metadata`.
- Para pruebas de RLS: en Supabase Auth -> Settings -> JWT -> añadir claim 'role' en la generación de tokens (o usar un JWT de prueba en dev).

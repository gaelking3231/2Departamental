# Proyecto 2º Departamental - Tienda en línea (Scaffold)

**Contenido:** scaffold completo (backend SQL migrations + políticas RLS, frontend React/Vite con Tailwind, README, .env.example, scripts, y archivos de soporte).

**Instrucciones rápidas**
1. Clona el repo generado o extrae el ZIP.
2. Backend (Supabase):
   - Usa `supabase/migrations/` para ejecutar SQL en tu proyecto Supabase (puedes usar Supabase SQL Editor o `supabase` CLI).
   - Añade las variables de entorno para JWT role en autenticación cuando pruebes RLS localmente.
3. Frontend:
   - `cd frontend` 
   - `npm install`
   - Copia `.env.example` a `.env` y rellena `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
   - `npm run dev`
4. Documentación adicional en `/docs`.

**Archivos incluidos**
- `supabase/migrations/` - tablas y políticas RLS (SQL).
- `frontend/` - aplicación React (Vite) con integración básica a Supabase, componentes principales y ejemplos.
- `docs/` - ERD ASCII, decisiones técnicas y pruebas sugeridas.
- `sample-seeds/` - archivo SQL de semillas.

Decisiones técnicas (resumen)
- Backend: Supabase (Auth + Postgres + Storage + RLS). Elegido por rapidez de integración y políticas a nivel de fila.
- Frontend: Vite + React + Tailwind (mobile-first). Facilita desarrollo y estilo.
- Estado: Context API para carrito + localStorage/supabase (persistencia).
- Seguridad: RLS en tablas críticas; JWT claim 'role' para distinguir admin/user.
- Paginas protegidas: rutas protegidas con wrapper que verifica sesión.

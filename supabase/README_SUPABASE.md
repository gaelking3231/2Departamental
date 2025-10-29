Supabase setup (quick)
1. Crea proyecto en supabase.com
2. En SQL editor, ejecuta `supabase/migrations/001_schema.sql` y luego `002_rls_and_policies.sql`
3. En Authentication -> Providers, configura al menos un OAuth (ej: GitHub) y habilita correo electrónico.
4. Añade seed data con `supabase/seed/sample_seed.sql`
5. En Storage, crea un bucket 'product-images' y configura políticas si usarás Storage.

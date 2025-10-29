-- sample_seed.sql
insert into categories (id, name, description) values
(gen_random_uuid(), 'Ropa', 'Prendas y accesorios'),
(gen_random_uuid(), 'Electrónica', 'Gadgets y dispositivos'),
(gen_random_uuid(), 'Hogar', 'Artículos para el hogar');

insert into products (id, category_id, name, description, price, stock, images, is_active) values
(gen_random_uuid(), (select id from categories where name='Ropa' limit 1), 'Camiseta Urbana', 'Camiseta estilo baggy', 299.00, 50, array['https://example.com/img1.jpg'], true),
(gen_random_uuid(), (select id from categories where name='Electrónica' limit 1), 'Auriculares Gamer', 'Auriculares con micrófono', 1299.00, 20, array['https://example.com/img2.jpg'], true);

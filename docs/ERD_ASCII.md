ERD (ASCII simple)

profiles(id) 1---* carts(id)
profiles(id) 1---* orders(id)
categories 1---* products
products 1---* cart_items
orders 1---* order_items

Relaciones:
- profiles -> carts (1:n)
- carts -> cart_items (1:n)
- orders -> order_items (1:n)
- products -> order_items (1:n)

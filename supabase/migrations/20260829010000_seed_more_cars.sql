-- Fills out the storefront grid, which pages eight cars at a time.
insert into public.products (name, price, stock, category, image_url) values
  ('Aston Martin DB11', 1890.00, 4, 'Coupe', '/client-side/cars/astonmartin.jpg'),
  ('BMW X5', 940.00, 7, 'SUV', '/client-side/cars/bmw.jpg'),
  ('Mercedes C-Class', 820.00, 6, 'Sedan', '/client-side/cars/mercedes.webp'),
  ('Tesla Model 3', 760.00, 9, 'Sedan', '/client-side/cars/tesla.jpg'),
  ('Audi A6', 680.00, 11, 'Sedan', '/client-side/cars/audi.jpg');

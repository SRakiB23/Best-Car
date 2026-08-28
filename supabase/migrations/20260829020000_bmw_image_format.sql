-- The AVIF source passed straight through the image optimiser unresized, so the
-- card rendered nothing. JPEG is handled like every other seeded car image.
update public.products
set image_url = '/client-side/cars/bmw.jpg'
where image_url = '/client-side/cars/bmw.avif';

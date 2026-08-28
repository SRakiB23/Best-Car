alter table public.products add column image_url text not null default '';

comment on column public.products.image_url is
  'Either a path under /public (seeded cars) or a full Supabase Storage URL (uploaded cars).';

update public.products set image_url = '/products/range-rover.jpg' where name = 'Range Rover';
update public.products set image_url = '/products/audi-s3.jpg' where name = 'Audi S3';
update public.products set image_url = '/products/blue-nissan.jpg' where name = 'Blue Nissan';
update public.products set image_url = '/products/toyota-corolla.jpg' where name = 'Toyota Corolla';
update public.products set image_url = '/products/compact-car.jpg' where name = 'Compact car';
update public.products set image_url = '/products/red-toyota.jpg' where name = 'Red Toyota';

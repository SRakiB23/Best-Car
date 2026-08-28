-- createProduct removes the uploaded file when the row insert fails, so the
-- bucket does not collect images that belong to no product.
create policy "signed in users remove product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');

"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "./auth";
import type { FormState } from "./form-state";
import { imageProblem, productBucket, storedPath } from "./images";
import { productCategories } from "./products";
import { removeImage, uploadImage } from "./storage";
import { createClient } from "./supabase/server";

function readFields(form: FormData, imageRequired: boolean) {
  const name = String(form.get("name") ?? "").trim();
  const category = String(form.get("category") ?? "");
  const price = Number(String(form.get("price") ?? "").trim());
  const stock = Number(String(form.get("stock") ?? "").trim());
  const picked = form.get("image");
  const image = picked instanceof File && picked.size > 0 ? picked : null;

  const errors: Record<string, string> = {};
  if (name.length < 3) errors.name = "Enter at least 3 characters.";
  if (!productCategories.some((option) => option === category)) errors.category = "Choose a category.";
  if (!(price > 0)) errors.price = "Enter a price greater than 0.";
  if (!Number.isInteger(stock) || stock < 1) errors.stock = "Enter a whole number of 1 or more.";

  if (image) {
    const problem = imageProblem(image);
    if (problem) errors.image = problem;
  } else if (imageRequired) {
    errors.image = "Choose a photo of the car.";
  }

  return { name, category, price, stock, image, errors };
}

function refresh() {
  revalidatePath("/admin", "layout");
}

export async function createProduct(_previous: FormState, form: FormData): Promise<FormState> {
  const { name, category, price, stock, image, errors } = readFields(form, true);

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", errors };
  }

  await requireUser();
  const supabase = await createClient();

  const upload = await uploadImage(supabase, productBucket, "", name, image!);
  if (upload.error) {
    return { status: "error", message: `Could not upload the image: ${upload.error}` };
  }

  const { error } = await supabase
    .from("products")
    .insert({ name, category, price, stock, image_url: upload.publicUrl });

  if (error) {
    await removeImage(supabase, productBucket, upload.path);
    return { status: "error", message: `Could not save the product: ${error.message}` };
  }

  refresh();
  return { status: "success", message: `${name} added to your inventory.` };
}

export async function updateProduct(_previous: FormState, form: FormData): Promise<FormState> {
  const id = String(form.get("id") ?? "");
  const { name, category, price, stock, image, errors } = readFields(form, false);

  if (!id) return { status: "error", message: "That product no longer exists." };
  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", errors };
  }

  await requireUser();
  const supabase = await createClient();

  const existing = await supabase.from("products").select("image_url").eq("id", id).maybeSingle();
  if (!existing.data) return { status: "error", message: "That product no longer exists." };

  let imageUrl = existing.data.image_url ?? "";

  if (image) {
    const upload = await uploadImage(supabase, productBucket, "", name, image);
    if (upload.error) {
      return { status: "error", message: `Could not upload the image: ${upload.error}` };
    }
    imageUrl = upload.publicUrl;
  }

  const { error } = await supabase
    .from("products")
    .update({ name, category, price, stock, image_url: imageUrl })
    .eq("id", id);

  if (error) return { status: "error", message: `Could not save the product: ${error.message}` };

  // The replaced photo is only unreachable once the row points at the new one.
  if (image) {
    await removeImage(supabase, productBucket, storedPath(productBucket, existing.data.image_url ?? ""));
  }

  refresh();
  return { status: "success", message: `${name} updated.` };
}

export async function deleteProduct(_previous: FormState, form: FormData): Promise<FormState> {
  const id = String(form.get("id") ?? "");
  if (!id) return { status: "error", message: "That product no longer exists." };

  await requireUser();
  const supabase = await createClient();

  const product = await supabase
    .from("products")
    .select("name, image_url")
    .eq("id", id)
    .maybeSingle();

  if (!product.data) return { status: "error", message: "That product no longer exists." };

  // bookings.vehicle_id is on delete restrict, so a rented car would fail at the
  // database with a raw foreign key error. Say so plainly instead.
  const booked = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("vehicle_id", id);

  if (booked.count && booked.count > 0) {
    return {
      status: "error",
      message: `${product.data.name} has ${booked.count} booking(s) against it and cannot be deleted.`,
    };
  }

  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id);

  if (count && count > 0) {
    return {
      status: "error",
      message: `${product.data.name} has ${count} rental(s) behind it and cannot be deleted.`,
    };
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { status: "error", message: `Could not delete the product: ${error.message}` };

  await removeImage(supabase, productBucket, storedPath(productBucket, product.data.image_url ?? ""));

  refresh();
  return { status: "success", message: `${product.data.name} deleted.` };
}

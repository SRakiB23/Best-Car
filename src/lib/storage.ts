import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./supabase/database.types";

type Client = SupabaseClient<Database>;

export function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "file";
}

export async function uploadImage(
  supabase: Client,
  bucket: string,
  folder: string,
  name: string,
  image: File,
) {
  const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
  const file = `${slug(name)}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
  const path = folder ? `${folder}/${file}` : file;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, image, { contentType: image.type });

  if (error) return { error: error.message, path: "", publicUrl: "" };

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return { error: "", path, publicUrl };
}

export async function removeImage(supabase: Client, bucket: string, path: string) {
  if (path) await supabase.storage.from(bucket).remove([path]);
}

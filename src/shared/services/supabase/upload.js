import { supabase } from "./client";

const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 30; // 30 days

export async function uploadImage(localUri, bucket, pathPrefix = "uploads") {
  if (!localUri) throw new Error("No image URI provided");

  const resp = await fetch(localUri);
  if (!resp.ok) throw new Error(`Failed to read image: ${resp.status}`);

  const arrayBuffer = await resp.arrayBuffer();
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new Error("Image file is empty");
  }

  const ext = localUri.split(".").pop()?.split("?")[0] || "jpg";
  const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, arrayBuffer, { contentType: `image/${ext}`, upsert: false });

  if (error) throw error;

  const { data: signed, error: signError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(data.path, SIGNED_URL_EXPIRY);

  if (signError) throw signError;

  return { path: data.path, signedUrl: signed.signedUrl };
}

export async function deleteImage(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export async function uploadImages(uris, bucket, pathPrefix) {
  return Promise.all(uris.map((uri) => uploadImage(uri, bucket, pathPrefix)));
}

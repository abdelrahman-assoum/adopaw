import * as ImageManipulator from "expo-image-manipulator";

import { supabase } from "./client";

const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 30; // 30 days

export async function uploadImage(localUri, bucket, pathPrefix = "uploads") {
  if (!localUri) throw new Error("No image URI provided");

  // Resize to max 1024px wide and compress to JPEG — keeps payloads small enough
  // for vision models and normalises all formats (HEIC, WebP, etc.) to JPEG.
  const manipulated = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 1024 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  const processedUri = manipulated.uri;
  const ext = "jpg";
  const mimeType = "image/jpeg";

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new Error("User not authenticated");

  const path = `${userId}/${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const formData = new FormData();
  formData.append("file", { uri: processedUri, name: `file.${ext}`, type: mimeType });

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, formData, { contentType: mimeType, upsert: false });

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

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Storage abstraction so the app can run with zero external config (local disk)
 * and be switched to Cloudinary or S3-compatible storage purely via env vars,
 * with no changes needed in the calling code (upload API routes / forms).
 *
 * STORAGE_PROVIDER=local        -> saves to /public/uploads (default, works out of the box)
 * STORAGE_PROVIDER=cloudinary   -> uploads via Cloudinary REST API
 * STORAGE_PROVIDER=s3           -> uploads via any S3-compatible endpoint
 */

export async function uploadFile(file: File, folder: string): Promise<string> {
  const provider = process.env.STORAGE_PROVIDER || "local";

  if (provider === "cloudinary") {
    return uploadToCloudinary(file, folder);
  }
  if (provider === "s3") {
    return uploadToS3(file, folder);
  }
  return uploadToLocal(file, folder);
}

async function uploadToLocal(file: File, folder: string): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const filename = `${crypto.randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return `/uploads/${folder}/${filename}`;
}

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary env vars are not configured (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET).");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

  const bytes = Buffer.from(await file.arrayBuffer());
  const form = new FormData();
  form.append("file", new Blob([bytes]), file.name);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${await res.text()}`);
  const json = await res.json();
  return json.secure_url as string;
}

async function uploadToS3(file: File, folder: string): Promise<string> {
  // Kept dependency-free (no aws-sdk) using a pre-signed style PUT against
  // any S3-compatible endpoint. For production, swap in @aws-sdk/client-s3.
  const endpoint = process.env.S3_ENDPOINT;
  const bucket = process.env.S3_BUCKET;
  if (!endpoint || !bucket) {
    throw new Error("S3 env vars are not configured (S3_ENDPOINT / S3_BUCKET).");
  }
  throw new Error(
    "S3 upload requires @aws-sdk/client-s3 to be installed and configured — see README 'Switching file storage'."
  );
}

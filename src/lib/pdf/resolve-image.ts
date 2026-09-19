import fs from "fs";
import path from "path";

/**
 * Resolves an image URL or relative path to a Base64 data URI for @react-pdf/renderer.
 *
 * Why this is necessary:
 * @react-pdf/renderer running server-side makes internal HTTP fetch requests when given
 * web URLs (e.g. https://invoise.in/uploads/... or http://localhost:3000/uploads/...).
 * In production environments (like Hostinger, Cloudflare, Docker, or behind SSL proxies),
 * server-side loopback HTTP requests to the same domain frequently fail or time out.
 *
 * By resolving images directly from the local disk as Base64 data URIs (or fetching remote
 * URLs server-side into Base64), @react-pdf/renderer loads the image bytes purely in-memory
 * with zero network calls, zero loopback timeouts, and 100% reliability.
 */
export async function resolveImageToDataUri(
  imageUrl: string | null | undefined,
  fallbackRelativePath?: string
): Promise<string> {
  // 1. If empty, try fallback
  if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
    if (fallbackRelativePath) {
      return getLocalFileBase64(path.join(process.cwd(), "public", fallbackRelativePath));
    }
    return "";
  }

  const trimmed = imageUrl.trim();

  // 2. Already a data URI? Return as-is
  if (trimmed.startsWith("data:")) {
    return trimmed;
  }

  // 3. Try reading as a local file from /public/...
  let localRelativePath = "";
  if (trimmed.startsWith("/") || !trimmed.startsWith("http")) {
    localRelativePath = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  } else {
    try {
      const parsed = new URL(trimmed);
      // If URL points to localhost or domain, extract pathname
      localRelativePath = parsed.pathname.startsWith("/") ? parsed.pathname.slice(1) : parsed.pathname;
    } catch {
      // Not a valid URL
    }
  }

  if (localRelativePath) {
    const fullDiskPath = path.join(process.cwd(), "public", localRelativePath);
    const localBase64 = getLocalFileBase64(fullDiskPath);
    if (localBase64) {
      return localBase64;
    }
  }

  // 4. If it's a remote URL (e.g. Cloudinary, AWS S3, etc.)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(trimmed, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const contentType = res.headers.get("content-type") || "image/png";
        return `data:${contentType};base64,${buffer.toString("base64")}`;
      }
    } catch (err) {
      console.warn(`[PDF IMAGE RESOLVER] Failed to fetch remote image: "${trimmed}"`, err);
    }
  }

  // 5. Fallback to default asset if provided and primary file wasn't found
  if (fallbackRelativePath) {
    const fallbackBase64 = getLocalFileBase64(path.join(process.cwd(), "public", fallbackRelativePath));
    if (fallbackBase64) {
      return fallbackBase64;
    }
  }

  return "";
}

function getLocalFileBase64(filePath: string): string {
  try {
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase().replace(".", "");
      let mime = "image/png";
      if (ext === "jpg" || ext === "jpeg") mime = "image/jpeg";
      else if (ext === "svg") mime = "image/svg+xml";
      else if (ext === "webp") mime = "image/webp";
      return `data:${mime};base64,${buffer.toString("base64")}`;
    }
  } catch (err) {
    console.warn(`[PDF IMAGE RESOLVER] Error reading local file "${filePath}":`, err);
  }
  return "";
}


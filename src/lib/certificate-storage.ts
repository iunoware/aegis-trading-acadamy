import path from "path";
import crypto from "crypto";
import { s3Client, S3_BUCKET, S3_REGION } from "@/lib/s3";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const CERT_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const CERT_MAX_BYTES = 50 * 1024 * 1024;
const CERT_PREFIX = "certificates/";

function getFileExtension(file: File) {
  const extensionFromName = path.extname(file.name).toLowerCase();

  if (extensionFromName) {
    return extensionFromName;
  }

  const extensions: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
  };

  return extensions[file.type] || "";
}

/**
 * Uploads a certificate image to S3 under a public prefix and returns
 * its public URL.
 */
export async function saveCertificateImage(file: File): Promise<string> {
  if (!CERT_MIME.includes(file.type)) {
    throw new Error("Only JPG, PNG, WebP and AVIF images are allowed");
  }
  if (file.size > CERT_MAX_BYTES) {
    throw new Error("Certificate image must be smaller than 5 MB");
  }

  const ext = getFileExtension(file);
  const key = `${CERT_PREFIX}certificate-${Date.now()}-${crypto.randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }),
  );

  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
}

/**
 * Deletes a certificate image given its stored URL. Safe no-op for
 * anything that isn't one of our own S3 certificate URLs (e.g. leftover
 * local "/uploads/certificates/..." paths from before this migration).
 */
export async function deleteCertificateImage(imageUrl: string) {
  const base = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/`;
  const prefix = `${base}${CERT_PREFIX}`;

  if (!imageUrl.startsWith(prefix)) {
    return;
  }

  const key = imageUrl.slice(base.length);

  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
  } catch (error) {
    console.error(`Failed to delete S3 certificate image "${key}":`, error);
  }
}

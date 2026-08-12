import crypto from "crypto";

/**
 * Generates a cryptographically secure 6-digit numeric OTP string (e.g. "482910")
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Computes a SHA-256 hash of the plain OTP string for database storage
 */
export function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp.trim()).digest("hex");
}

/**
 * Safely compares a submitted plain OTP against a stored SHA-256 hash using timingSafeEqual
 */
export function verifyOTPHash(plainOTP: string, storedHash: string): boolean {
  if (!plainOTP || !storedHash) return false;
  const computedHash = hashOTP(plainOTP);

  try {
    const bufA = Buffer.from(computedHash, "hex");
    const bufB = Buffer.from(storedHash, "hex");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

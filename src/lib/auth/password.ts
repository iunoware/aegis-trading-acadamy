import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");

  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedPassword: string): boolean {
  try {
    const [salt, storedHash] = storedPassword.split(":");

    if (!salt || !storedHash) {
      return false;
    }

    const hash = scryptSync(password, salt, 64);

    const storedHashBuffer = Buffer.from(storedHash, "hex");

    if (hash.length !== storedHashBuffer.length) {
      return false;
    }

    return timingSafeEqual(hash, storedHashBuffer);
  } catch {
    return false;
  }
}

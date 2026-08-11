import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "aegis_trading_session";

const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }

  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
  role: string;
};

export async function createSession(userId: string, role: string): Promise<string> {
  return new SignJWT({
    userId,
    role,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getAuthSecret());
}

export async function verifySession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getAuthSecret());

    if (typeof payload.userId !== "string" || typeof payload.role !== "string") {
      return null;
    }

    return {
      userId: payload.userId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

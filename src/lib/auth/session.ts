import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type SessionPayload = {
  userId: string;
};

const SESSION_COOKIE_NAME = "aegis_trading_session";

function getAuthSecret() {
  if (!process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET is not set");
  }

  return new TextEncoder().encode(process.env.AUTH_SECRET);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2d")
    .sign(getAuthSecret());

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 2,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getAuthSecret());

    if (!payload.userId || typeof payload.userId !== "string") {
      return null;
    }

    return {
      userId: payload.userId,
    };
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export { SESSION_COOKIE_NAME };

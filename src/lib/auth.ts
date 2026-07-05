import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE_NAME = "pricelytix_session";
const SESSION_EXPIRY = "7d"; // 7 days
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[AUTH WARNING] JWT_SECRET is not set in environment. Using default fallback key for development."
      );
    }
    return new TextEncoder().encode(
      "pricelytix_dev_secret_key_change_in_production_32bytes"
    );
  }
  return new TextEncoder().encode(secret);
}

// Password Hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Session Management
export async function createSession(userId: string): Promise<void> {
  const secret = getJwtSecret();
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRY)
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export interface SessionPayload {
  userId: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    const userId = payload.userId as string;
    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      user,
    };
  } catch (error) {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function verifyTokenString(token: string): Promise<{ userId: string } | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId as string;
    return userId ? { userId } : null;
  } catch (error) {
    return null;
  }
}

import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { db } from "./db";

const derive = promisify(scrypt);
export const sessionCookie = "mealmate_session";
const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await derive(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, encoded] = stored.split(":");
  const hash = (await derive(password, salt, 64)) as Buffer;
  const expected = Buffer.from(encoded, "hex");
  return expected.length === hash.length && timingSafeEqual(expected, hash);
}

// This is the only auth lookup the REST API needs. Replace it with Cognito JWT verification in Phase 4.
export async function currentUser(request: Request) {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${sessionCookie}=`));
  if (!cookie) return null;
  const token = cookie.slice(sessionCookie.length + 1);
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await db.session.findUnique({
    where: { id: digest(token) },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return session && session.expiresAt > new Date() ? session.user : null;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  await db.session.create({
    data: {
      id: digest(token),
      userId,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
  });
  return `${sessionCookie}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export async function deleteSession(request: Request) {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${sessionCookie}=`));
  if (cookie)
    await db.session.deleteMany({
      where: { id: digest(cookie.slice(sessionCookie.length + 1)) },
    });
  return `${sessionCookie}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

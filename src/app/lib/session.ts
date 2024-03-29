import { cookies } from "next/headers";
import { getIronSession, SessionOptions } from "iron-session";

const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD!,
  cookieName: "next-webauthn",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
  ttl: 60 * 60 * 24,
};

export async function withSession() {
  return await getIronSession(cookies(), sessionOptions);
}

export async function logout() {
  const session = await withSession();
  session.destroy();
}

export async function isLoggedIn() {
  const session = await withSession();
  return !!session.user;
}

declare module "iron-session" {
  interface IronSession<T> {
    challenge: string; // or the appropriate type
    email: string;
  }
}

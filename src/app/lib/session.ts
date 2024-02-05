import { cookies } from "next/headers";
import { getIronSession, SessionOptions } from "iron-session";

const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD!,
  cookieName: "next-webauthn",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export async function withSession() {
  return await getIronSession(cookies(), sessionOptions);
}

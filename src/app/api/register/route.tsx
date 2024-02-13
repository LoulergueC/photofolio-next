import { generateRegistrationOptions, verifyRegistrationResponse } from "@simplewebauthn/server";
import { withSession } from "@/app/lib/session";
import db from "@/db/db";
import { users, credentials } from "@/db/schema";

// Human-readable title for your website
const rpName = "SimpleWebAuthn Example";
// A unique identifier for your website
const rpID = "localhost";
// The origin of your website
const origin = "http://localhost:3000";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  // Check if email is provided and valid
  if (!email || !email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
    return new Response(JSON.stringify({ error: "Email is required" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Check if email is not already registered
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });
  if (user) {
    return new Response(JSON.stringify({ error: "Email already registered" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: process.env.SECRET_USER_ID!,
      userName: email,
      // Don't prompt users for additional information about the authenticator
      // (Recommended for smoother UX)
      attestationType: "none",
      // See "Guiding use of authenticators via authenticatorSelection" below
      authenticatorSelection: {
        // Defaults
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    const session = await withSession();
    session.challenge = options.challenge;
    session.email = email;
    await session.save();

    return new Response(JSON.stringify(options), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  console.log(request);
  console.log(body);

  const session = await withSession();
  const expectedChallenge = session.challenge;

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: "localhost",
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const { verified } = verification;

  // If verified, create a new user
  if (verified && verification.registrationInfo) {
    const { registrationInfo } = verification;
    const { credentialPublicKey, credentialID } = registrationInfo;

    // Create a new user in the database if it doesn't exist
    await db
      .insert(users)
      .values({
        email: session.email!,
        id: process.env.SECRET_USER_ID!,
      })
      .onConflictDoNothing();

    // Create a new credential in the database
    await db.insert(credentials).values({
      externalId: credentialID,
      publicKey: credentialPublicKey,
      userId: process.env.SECRET_USER_ID!,
    });

    session.destroy();
    session.user = process.env.SECRET_USER_ID!;
    await session.save();
  }

  return new Response(JSON.stringify({ verified }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

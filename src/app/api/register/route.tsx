import { generateRegistrationOptions, verifyRegistrationResponse } from "@simplewebauthn/server";
import { PrismaClient } from "@prisma/client";
import { withSession } from "@/app/lib/session";

// Human-readable title for your website
const rpName = "SimpleWebAuthn Example";
// A unique identifier for your website
const rpID = "localhost";
// The origin of your website
const origin = "http://localhost:3000";
const prisma = new PrismaClient();

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
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
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
      // Random UUID to prevent browser fingerprinting
      userID: crypto.randomUUID(),
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
  } catch (error) {
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
  if (verified) {
    const { registrationInfo } = verification;
    const { credentialPublicKey, credentialID } = registrationInfo;

    await prisma.user.create({
      data: {
        email: session.email,
        credentials: {
          create: {
            externalId: Buffer.from(credentialID),
            publicKey: Buffer.from(credentialPublicKey),
          },
        },
      },
    });
  }

  return new Response(JSON.stringify({ verified }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

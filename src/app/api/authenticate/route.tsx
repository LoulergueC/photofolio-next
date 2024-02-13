import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { withSession } from "@/app/lib/session";
import db from "@/db/db";
import { credentials } from "@/db/schema";
import { eq } from "drizzle-orm";

// Human-readable title for your website
const rpName = "SimpleWebAuthn Example";
// A unique identifier for your website
const rpID = "localhost";
// The origin of your website
const origin = "http://localhost:3000";

export async function GET() {
  // catch the user in the database defined by the unique ID in the .env
  // and retrieve their credentials from the database
  const userCredentials = await db.query.credentials.findMany({
    where: (credentials, { eq }) => eq(credentials.userId, process.env.SECRET_USER_ID!),
    columns: {
      externalId: true,
    },
  });

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: userCredentials.map((credential) => ({
      id: credential.externalId,
      type: "public-key",
    })),
  });

  // Save the challenge in the session
  const session = await withSession();
  session.challenge = options.challenge;
  await session.save();

  return new Response(JSON.stringify(options), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  // Retrieve the challenge from the session
  const session = await withSession();
  const expectedChallenge = session.challenge;

  const authenticator = await db.query.credentials.findFirst({
    where: (credentials, { eq }) => eq(credentials.externalId, Buffer.from(body.id, "base64")),
    columns: {
      externalId: true,
      publicKey: true,
      signCount: true,
    },
  });

  if (!authenticator) {
    return new Response(JSON.stringify({ error: "Authenticator not found" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(authenticator.externalId),
        credentialPublicKey: Buffer.from(authenticator.publicKey),
        counter: authenticator.signCount,
      },
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

  // If verified, create a new session for the logged user
  // And increment the signCount in the db
  if (verified) {
    await db
      .update(credentials)
      .set({ signCount: authenticator.signCount + 1 })
      .where(eq(credentials.id, authenticator.externalId));

    const session = await withSession();
    session.user = {
      id: process.env.SECRET_USER_ID!,
    };
    await session.save();
  }

  return new Response(JSON.stringify({ verified }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

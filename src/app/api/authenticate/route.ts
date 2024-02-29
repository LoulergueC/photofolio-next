import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { withSession } from "@/app/lib/session";
import db from "@/db/db";

// A unique identifier for your website
const rpID = process.env.WA_RPID!;
// The origin of your website
const origin = process.env.WA_ORIGIN!;

export async function GET() {
  // catch the user in the database defined by the unique ID in the .env
  // and retrieve their credentials from the database
  const userCredentials = await db.user.findUnique({
    where: {
      id: process.env.SECRET_USER_ID!,
    },
    select: {
      credentials: true,
    },
  });

  if (!userCredentials) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: userCredentials.credentials.map((credential: any) => ({
      id: Buffer.from(credential.externalId),
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

  const authenticator = await db.credential.findFirst({
    where: {
      externalId: Buffer.from(body.id, "base64"),
    },
    select: {
      externalId: true,
      publicKey: true,
      signCount: true,
      id: true
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
  const { authenticationInfo } = verification;
  const { newCounter } = authenticationInfo;

  // If verified, create a new session for the logged user
  // And increment the signCount in the db
  if (verified) {
    await db.credential.update({
      where: {
        id: authenticator.id,
      },
      data: {
        signCount: newCounter
      },
    });

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

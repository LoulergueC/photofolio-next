import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { PrismaClient } from "@prisma/client";
import { withSession } from "@/app/lib/session";

const prisma = new PrismaClient();
// Human-readable title for your website
const rpName = "SimpleWebAuthn Example";
// A unique identifier for your website
const rpID = "localhost";
// The origin of your website
const origin = "http://localhost:3000";

export async function GET() {
  // catch the only user in the database
  const user = await prisma.user.findFirst();
  const userCrendentials = await prisma.credential.findMany({
    where: {
      userId: user?.id,
    },
  });

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: userCrendentials.map((credential) => ({
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

  const authenticator = await prisma.credential.findFirst({
    where: {
      externalId: Buffer.from(body.id, "base64"),
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

  // If verified, create a new session for the logged user
  // And increment the signCount in the db
  if (verified) {
    await prisma.credential.update({
      where: {
        id: authenticator.id,
      },
      data: {
        signCount: {
          increment: 1,
        },
      },
    });

    const session = await withSession();
    session.user = {
      id: authenticator.userId,
    };
    await session.save();
  }

  return new Response(JSON.stringify({ verified }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

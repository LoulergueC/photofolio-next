import db from "@/db/db";
import { NextApiRequest } from "next";
import { NextApiResponse } from "next";
export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const users = await db.user.findFirst({
    select: {
      createdAt: true,
    },
  });

  if (users) {
    return Response.json({ error: "Register is disabled : limited to 1 user" }, { status: 401 });
  }

  return Response.json({ ok: true }, { status: 200 });
}

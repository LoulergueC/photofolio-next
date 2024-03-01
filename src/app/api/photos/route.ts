import { Photo } from "@/app/admin/components/Photos/PhotoUpload";
import { withSession } from "@/app/lib/session";
import db from "@/db/db";
import { appendFileSync } from "node:fs";

export async function POST(request: Request) {
  const session = await withSession();

  if (!session.user.id) {
    return new Response(JSON.stringify({ error: "You must be logged in" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const photos = await request.json();

  photos.forEach(async (photo: Photo) => {
    const name = photo.name.split(".");
    name.splice(-1, 0, photo.id);
    const newName = name.join(".");

    try {
      appendFileSync(`./public/photos/${newName}`, Buffer.from(photo.buffer));
      console.log(newName + " uploaded");
    } catch (error) {
      console.error(error);
    }
  });

  return new Response("", {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

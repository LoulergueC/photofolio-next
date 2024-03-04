import { Photo } from "@/app/admin/components/Photos/PhotoUpload";
import { isLoggedIn, withSession } from "@/app/lib/session";
import db from "@/db/db";
import { appendFileSync } from "node:fs";

export async function POST(request: Request) {
  const session = await withSession();

  if (!(await isLoggedIn())) {
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

  const photosPromises = photos.map(async (photo: Photo) => {
    const name = photo.name.split(".");
    name.splice(-1, 0, photo.id);
    const newName = name.join(".");

    try {
      appendFileSync(`./public/photos/${newName}`, Buffer.from(photo.buffer));
      console.log(newName + " uploaded");

      const newPhoto = await db.photo.create({
        data: {
          name: newName,
          userId: user.id as string,
          description: photo.description,
          modelId: photo.model.id || 0,
          tags: {
            connect: photo.tags.map((tag) => ({ id: tag.id })),
          },
          width: photo.width,
          height: photo.height,
          aperture: photo.aperture,
          exposureTime: photo.exposureTime,
          iso: photo.iso.toString(),
          url: `/photos/${newName}`,
        },
      });

      return newPhoto;
    } catch (error) {
      console.error(error);
    }
  });

  await Promise.all(photosPromises);

  return new Response(JSON.stringify(photosPromises), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

import db from "@/db/db";

export async function GET() {
  const tags = await db.tag.findMany();

  if (!tags) {
    return new Response(JSON.stringify({ error: "Tags not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(JSON.stringify(tags), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

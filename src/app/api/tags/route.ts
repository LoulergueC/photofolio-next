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

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.name) {
    return new Response(JSON.stringify({ error: "Tag name is required" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const tag = await db.tag.create({ data: { name: body.name } });

  if (!tag) {
    return new Response(JSON.stringify({ error: "Tag not created : Unknown error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(JSON.stringify(tag), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

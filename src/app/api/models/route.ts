import db from "@/db/db";

export async function GET() {
  const models = await db.model.findMany();

  if (!models.length || !models) {
    return new Response(JSON.stringify({ error: "Models not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(JSON.stringify(models), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.name) {
    return new Response(JSON.stringify({ error: "Model name is required" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const model = await db.model.upsert({
    where: {
      name: body.name,
    },
    update: {},
    create: {
      name: body.name,
    },
  });

  if (!model) {
    return new Response(JSON.stringify({ error: "Model not created : Unknown error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(JSON.stringify(model), {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

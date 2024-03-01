import { isLoggedIn, logout } from "@/app/lib/session";
import { redirect } from "next/navigation";

export async function GET() {
  if (!(await isLoggedIn())) {
    return new Response(JSON.stringify({ error: "Not logged in" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function DELETE() {
  await logout();
  return redirect("/admin/login");
}

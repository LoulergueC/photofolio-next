import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { withSession } from "@/app/lib/session";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const session = await withSession();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/admin",
};

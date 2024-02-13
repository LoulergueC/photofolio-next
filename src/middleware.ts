import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { withSession } from "@/app/lib/session";

export async function middleware(request: NextRequest) {
  const session = await withSession();

  // Redirect to login if not authenticated
  if (!session?.user && request.nextUrl.pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (
    session.user &&
    (request.nextUrl.pathname === "/admin/login" || request.nextUrl.pathname === "/admin/register")
  ) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/(admin/*.*)",
};

import { NextFetchEvent, NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { withSession } from "@/app/lib/session";

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const session = await withSession();

  // Redirect to login if user already in the db
  if (!session?.user && request.nextUrl.pathname === "/admin/register") {
    return await fetch(request.nextUrl.origin + "/api/checkSingleUser")
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok) {
          console.log(data.error);
          return NextResponse.redirect(new URL("/admin/login", request.url));
        }
      })
      .catch((err) => console.error("err :", err));
  }

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

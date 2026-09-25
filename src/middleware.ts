import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("aqua_lens_session")?.value;
  const path = request.nextUrl.pathname;

  // Public paths - no auth required
  const publicPaths = [
    "/login",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/logout",
    "/api/admin/seed-users",
  ];

  if (
    publicPaths.some(p => path === p || path.startsWith(p)) ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon.ico") ||
    path.startsWith("/images")
  ) {
    return NextResponse.next();
  }

  if (!token) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Decode JWT payload (Edge-compatible — no crypto)
    const parts = token.split(".");
    if (parts.length === 3) {
      // Use atob for Edge runtime
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "==".slice(0, (4 - base64.length % 4) % 4);
      const payload = JSON.parse(atob(padded));

      const role = (payload.role === "ADMIN" || payload.role === "ADMINISTRATOR") ? "ADMIN" : "USER";

      if (role === "USER") {
        const allowedUserPaths = [
          "/user",
          "/ask",
          "/complaints",
          "/api/ask-aqua-lens",
          "/api/ai/query",
          "/api/complaints",
          "/api/auth",
        ];

        const isAllowed = allowedUserPaths.some(p => path === p || path.startsWith(p + "/") || path.startsWith(p + "?"));

        if (!isAllowed) {
          if (path.startsWith("/api/")) {
            return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
          }
          return NextResponse.redirect(new URL("/user", request.url));
        }
      }

      // ADMIN on /user homepage → redirect to admin dashboard
      if (role === "ADMIN" && path === "/user") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  } catch (err) {
    // Token parsing failed — force re-login
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};


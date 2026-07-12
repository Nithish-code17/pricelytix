import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "pricelytix_session";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  return new TextEncoder().encode(
    secret || "pricelytix_dev_secret_key_change_in_production_32bytes"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let isAuthenticated = false;

  if (token) {
    try {
      const secret = getJwtSecret();
      await jwtVerify(token, secret);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // Protect private dashboard routes
  const isProtectedRoute =
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/add-product") ||
      pathname.startsWith("/products") ||
      pathname.startsWith("/ai-assistant") ||
      pathname.startsWith("/api/ai/assistant")) &&
    !pathname.startsWith("/api/cron/refresh-prices");

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages (/login, /signup)
  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard",
    "/add-product/:path*",
    "/add-product",
    "/products/:path*",
    "/login",
    "/signup",
    "/ai-assistant/:path*",
    "/ai-assistant",
    "/api/ai/assistant",
  ],
};

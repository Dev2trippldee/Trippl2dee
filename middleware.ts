import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookie } from "./server-actions/cookies";
import { PUBLIC_ROUTES } from "@/lib/constants/routes";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // List of public routes that don't require authentication
  // Handle both with and without trailing slash
  const publicRoutes = PUBLIC_ROUTES;
  const normalizedPath = pathname.endsWith('/') && pathname !== '/' 
    ? pathname.slice(0, -1) 
    : pathname;
  
  // Allow access to public routes without authentication
  if (publicRoutes.includes(normalizedPath as typeof publicRoutes[number])) {
    console.log("✅ Allowing public route:", normalizedPath);
    return NextResponse.next();
  }
  
  // Log the current request pathname
  console.log("🔒 Checking protected route:", normalizedPath);
  const token = await getCookie();
  if (!token) {
    console.log("❌ No token found, redirecting to signin");
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  
  console.log("✅ Token found, allowing access");
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - photos (public photos)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|photos).*)",
  ],
};

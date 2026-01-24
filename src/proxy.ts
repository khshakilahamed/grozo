import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
      const { pathname } = req.nextUrl;

      const publicRoutes = ["/login", "/register", "/api/auth", "/favicon.ico", "/_next", "/api/socket"];
      if (publicRoutes.some(path => pathname.startsWith(path))) {
            return NextResponse.next();
      }

      const token = await getToken({ req, secret: process.env.AUTH_SECRET });

      if (!token) {
            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("callbackUrl", req.url);

            return NextResponse.redirect(loginUrl);
      }

      const role = token.role;
      if (pathname.startsWith("/user") && role !== "user") {
            return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
      if (pathname.startsWith("/delivery") && role !== "deliveryBoy") {
            return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
      if (pathname.startsWith("/admin") && role !== "admin") {
            return NextResponse.redirect(new URL("/unauthorized", req.url))
      }

      return NextResponse.next();
}

export const config = {
      // Exclude all files in the public folder and other static assets
      // matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
      matcher: ["/((?!api/user/stripe/webhook|_next/static|_next/image|favicon.ico).*)",], // also exclude the stripe webhook
};
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  let isAuth = false;
  let role: string | undefined;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      isAuth = true;
      role = payload.role as string;
    } catch {
      isAuth = false;
    }
  }

  const { pathname } = req.nextUrl;
  const home = role === "ADMIN" ? "/admin" : "/client";
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminArea = pathname.startsWith("/admin");
  const isClientArea = pathname.startsWith("/client");

  // Pas connecté : accès interdit aux espaces privés
  if ((isAdminArea || isClientArea) && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  // Un client ne peut pas entrer dans l'espace admin
  if (isAdminArea && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/client", req.url));
  }
  // Un admin va dans son espace, pas dans celui des clients
  if (isClientArea && role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  // Déjà connecté : inutile de revoir login / register
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL(home, req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/client/:path*", "/login", "/register"],
};
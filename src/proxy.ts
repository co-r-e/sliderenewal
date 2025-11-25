import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Redirect /en to / (Canonical URL)
    if (pathname === "/en") {
        return NextResponse.redirect(new URL("/", request.url));
    }
    if (pathname.startsWith("/en/")) {
        return NextResponse.redirect(new URL(pathname.replace(/^\/en/, ""), request.url));
    }

    // 2. Rewrite root (and other non-ja paths) to /en
    // If it starts with /ja, let it pass (it will match [lang])
    if (pathname.startsWith("/ja")) {
        return;
    }

    // Otherwise, rewrite to /en so it matches [lang]
    // e.g. / -> /en
    return NextResponse.rewrite(new URL(`/en${pathname}`, request.url));
}

export const config = {
    matcher: [
        // Skip all internal paths (_next) and static files
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp|.*\\.ico).*)",
    ],
};

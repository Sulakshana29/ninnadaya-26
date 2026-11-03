import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createAdminToken,
  safeEqual,
} from "@/lib/admin-session";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // 5 attempts per 15 minutes per IP
    const limit = rateLimit(`admin-login:${getClientIp(request)}`, 5, 15 * 60 * 1000);
    if (!limit.ok) {
      return NextResponse.json(
        { success: false, error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minutes.` },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
      );
    }

    const { password } = await request.json();
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword || !process.env.ADMIN_SESSION_SECRET) {
      console.error("CRITICAL: ADMIN_PASSWORD or ADMIN_SESSION_SECRET environment variable is not set.");
      return NextResponse.json({ success: false, error: "Server misconfiguration. Please contact support." }, { status: 500 });
    }

    if (typeof password === "string" && safeEqual(password, correctPassword)) {
      // Set a signed, expiring session cookie
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_COOKIE, await createAdminToken(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: ADMIN_SESSION_TTL_SECONDS,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// Logout — clears the admin session cookie
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  return NextResponse.json({ success: true });
}

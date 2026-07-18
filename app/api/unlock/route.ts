import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  deriveToken,
  hasValidAccessCookie,
  isAccessConfigured,
  verifyAccessCode,
} from "@/lib/access";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Reports whether the gate is active and, if so, whether this client is
// unlocked. The client uses this to decide between the unlock screen and the app.
export async function GET(req: NextRequest) {
  if (!isAccessConfigured()) {
    return NextResponse.json({ required: false, unlocked: true });
  }
  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  return NextResponse.json({
    required: true,
    unlocked: await hasValidAccessCookie(token),
  });
}

// Exchanges a correct access code for an httpOnly session cookie.
export async function POST(req: NextRequest) {
  if (!isAccessConfigured()) {
    return NextResponse.json({ ok: true });
  }

  let body: { code?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const code = typeof body.code === "string" ? body.code : "";
  if (!code || !verifyAccessCode(code)) {
    return NextResponse.json(
      { ok: false, error: "Incorrect access code." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: ACCESS_COOKIE,
    value: await deriveToken(code),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}

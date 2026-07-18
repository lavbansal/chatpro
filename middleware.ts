import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, hasValidAccessCookie } from "@/lib/access";

// Gate the credit-spending chat endpoint. When no ACCESS_CODE is configured the
// check passes through, so local dev works without any setup.
export async function middleware(req: NextRequest) {
  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  if (await hasValidAccessCookie(token)) {
    return NextResponse.next();
  }
  return NextResponse.json({ error: "Access code required." }, { status: 401 });
}

export const config = {
  matcher: "/api/chat/:path*",
};

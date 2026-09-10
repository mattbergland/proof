import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSession } from "@/lib/auth";
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/login", req.url));
  const row = await db.magicLink.findUnique({ where: { token } });
  if (!row || row.usedAt || row.expiresAt < new Date())
    return NextResponse.redirect(new URL("/login?error=expired", req.url));
  await db.magicLink.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });
  await setSession(row.userId);
  const user = await db.user.findUnique({ where: { id: row.userId } });
  return NextResponse.redirect(
    new URL(user?.workspaceId ? "/dashboard" : "/onboarding", req.url),
  );
}

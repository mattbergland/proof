import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email)
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    const workspace = await db.workspace.create({
      data: {
        name: email.split("@")[0] || "My workspace",
        slug: `${email.split("@")[0]}-${randomBytes(3).toString("hex")}`,
      },
    });
    user = await db.user.create({ data: { email, workspaceId: workspace.id } });
  }
  const token = randomBytes(24).toString("hex");
  await db.magicLink.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });
  const link = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/verify?token=${token}`;
  console.log("proove.now magic link", link);
  return NextResponse.json({
    link:
      process.env.NODE_ENV === "production" && process.env.SMTP_HOST
        ? undefined
        : link,
  });
}

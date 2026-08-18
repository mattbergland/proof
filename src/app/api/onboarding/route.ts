import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { CaptureType } from "@prisma/client";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { templates, typeLabels, type TemplateQuestion } from "@/lib/templates";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const name = String(form.get("name") || "My workspace");
  const website = String(form.get("website") || "");
  const captureType = String(form.get("captureType") || "CUSTOMER_WIN");
  const selectedType = (
    captureType in templates ? captureType : "CUSTOMER_WIN"
  ) as CaptureType;
  const file = form.get("logo");
  let logoUrl = user.workspace?.logoUrl || null;

  if (file instanceof File && file.size > 0) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const filename = `${randomBytes(8).toString("hex")}.${extension}`;
    const uploads = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploads, { recursive: true });
    await writeFile(
      path.join(uploads, filename),
      Buffer.from(await file.arrayBuffer()),
    );
    logoUrl = `/uploads/${filename}`;
  }

  const workspace = await db.workspace.upsert({
    where: { id: user.workspaceId || "missing" },
    update: { name, websiteUrl: website, logoUrl },
    create: {
      name,
      websiteUrl: website,
      logoUrl,
      slug: `${slugify(name)}-${randomBytes(2).toString("hex")}`,
    },
  });
  await db.user.update({
    where: { id: user.id },
    data: { workspaceId: workspace.id },
  });
  const questions = templates[captureType] || templates.CUSTOMER_WIN;
  const capture = await db.capture.create({
    data: {
      workspaceId: workspace.id,
      type: selectedType,
      name: typeLabels[selectedType] || "Customer Win",
      slug: `${slugify(typeLabels[selectedType] || "customer-win")}-${randomBytes(2).toString("hex")}`,
      status: "PUBLISHED",
      introHeadline: "We’d love to hear about your experience.",
      introBody: "This should only take about 90 seconds.",
      thankYouMessage: `Thanks for sharing your experience with ${name}.`,
      questions: {
        create: questions.map((question: TemplateQuestion, order: number) => ({
          label: question.label,
          type: question.type,
          order,
          required: question.required !== false,
          options: question.options,
        })),
      },
    },
  });
  return NextResponse.json({ ok: true, captureSlug: capture.slug });
}

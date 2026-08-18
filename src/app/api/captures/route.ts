import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { templates, type TemplateQuestion } from "@/lib/templates";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeQuestions(input: unknown, type: string): TemplateQuestion[] {
  if (!Array.isArray(input) || input.length === 0) {
    return templates[type] || templates.CUSTOM;
  }
  return input.map((question) =>
    typeof question === "string"
      ? { label: question, type: "LONG_TEXT" as const }
      : {
          label: String(question.label || "New question"),
          type: question.type || "LONG_TEXT",
          required: question.required !== false,
          options: question.options,
        },
  );
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user?.workspace)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const type = body.type || "CUSTOMER_WIN";
  const name = body.name || "Customer Win";
  const questions = normalizeQuestions(body.questions, type);
  const slug = `${slugify(name)}-${randomBytes(2).toString("hex")}`;
  const capture = await db.capture.create({
    data: {
      workspaceId: user.workspace.id,
      type,
      name,
      slug,
      status: body.status || "PUBLISHED",
      themeId: body.themeId || "paper",
      fontId: body.fontId || "modern",
      showLogo: body.showLogo !== false,
      introHeadline:
        body.introHeadline || "We’d love to hear about your experience.",
      introBody: body.introBody || "This should only take about 90 seconds.",
      thankYouMessage:
        body.thankYouMessage ||
        `Thanks for sharing your experience with ${user.workspace.name}.`,
      questions: {
        create: questions.map((question, index) => ({
          label: question.label,
          order: index,
          type: question.type,
          required: question.required !== false,
          options: question.options,
        })),
      },
    },
    include: { questions: true },
  });
  return NextResponse.json({ capture });
}

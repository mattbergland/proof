import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { TemplateQuestion } from "@/lib/templates";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await currentUser();
  const { id } = await params;
  const capture = await db.capture.findUnique({ where: { id } });
  if (
    !user?.workspaceId ||
    !capture ||
    capture.workspaceId !== user.workspaceId
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const questions = (body.questions || []) as TemplateQuestion[];
  const updated = await db.$transaction(async (tx) => {
    await tx.question.deleteMany({ where: { captureId: id } });
    return tx.capture.update({
      where: { id },
      data: {
        type: body.type || capture.type,
        name: body.name,
        introHeadline: body.introHeadline,
        introBody: body.introBody,
        thankYouMessage: body.thankYouMessage,
        themeId: body.themeId,
        fontId: body.fontId,
        showLogo: body.showLogo !== false,
        status: body.status || capture.status,
        questions: {
          create: questions.map((question, order) => ({
            label: question.label,
            order,
            type: question.type,
            required: question.required !== false,
            options: question.options,
          })),
        },
      },
      include: { questions: true },
    });
  });
  return NextResponse.json({ capture: updated });
}

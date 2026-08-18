import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await currentUser();
  const { id } = await params;
  const capture = await db.capture.findUnique({
    where: { id },
    include: {
      submissions: { include: { answers: { include: { question: true } } } },
    },
  });
  if (!user || !capture || user.workspaceId !== capture.workspaceId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = capture.submissions.flatMap((s) =>
    s.answers.map((a) => ({
      submission: s.id,
      createdAt: s.createdAt.toISOString(),
      question: a.question.label,
      value: String(a.value),
    })),
  );
  const csv = [
    "submission,createdAt,question,value",
    ...rows.map((r) =>
      [r.submission, r.createdAt, r.question, r.value]
        .map((v) => `"${v.replaceAll('"', '""')}"`)
        .join(","),
    ),
  ].join("\n");
  return new Response(csv, {
    headers: {
      "content-type": "text/csv",
      "content-disposition": `attachment; filename="${capture.slug}.csv"`,
    },
  });
}

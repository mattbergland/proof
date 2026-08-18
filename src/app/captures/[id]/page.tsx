import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import CaptureEditor from "@/components/capture-editor";
import { Button } from "@/components/ui";

export default async function CaptureEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  const { id } = await params;
  const capture = await db.capture.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!capture || !user || capture.workspaceId !== user.workspaceId) notFound();

  return (
    <>
      <CaptureEditor
        mode="edit"
        captureId={capture.id}
        initialType={capture.type}
        initialName={capture.name}
        initialHeadline={capture.introHeadline}
        initialBody={capture.introBody}
        initialThankYou={capture.thankYouMessage}
        initialTheme={capture.themeId}
        initialFont={capture.fontId}
        initialShowLogo={capture.showLogo}
        initialQuestions={capture.questions.map((question) => ({
          id: question.id,
          label: question.label,
          type: question.type,
          required: question.required,
          options: Array.isArray(question.options)
            ? question.options.map(String)
            : undefined,
        }))}
      />
      <div className="mx-auto flex max-w-3xl gap-3 px-5 pb-12 md:px-10">
        <Link href={`/c/${capture.slug}`}>
          <Button>Open public capture</Button>
        </Link>
        <a
          href={`/api/captures/${capture.id}/export`}
          className="rounded-md border border-[#bdb7ac] px-4 py-2.5 text-sm font-medium"
        >
          Export CSV
        </a>
      </div>
    </>
  );
}

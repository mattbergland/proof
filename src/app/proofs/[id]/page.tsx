import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header, CopyButton } from "@/components/ui";
import { permissionLabels, permissionOptions } from "@/lib/templates";
import ProofEditor from "./proof-editor";

export default async function ProofDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proof = await db.proof.findUnique({
    where: { id },
    include: {
      submission: { include: { answers: { include: { question: true } } } },
      workspace: true,
      tags: { include: { tag: true } },
    },
  });
  if (!proof) notFound();
  const user = await currentUser();
  if (!user || user.workspaceId !== proof.workspaceId) {
    return <main className="p-10">Unauthorized</main>;
  }

  return (
    <main>
      <Header workspace={proof.workspace.name} />
      <div className="mx-auto max-w-4xl px-5 py-10 md:px-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm tracking-[.16em] text-[#b4540a] uppercase">
              {proof.submission.respondentCompany || "Customer"}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-.05em]">
              {proof.submission.respondentName || "Anonymous"}
            </h1>
            <p className="mt-2 text-[#726d63]">
              {[
                proof.submission.respondentTitle,
                proof.submission.respondentEmail,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div className="flex gap-4">
            <CopyButton value={proof.quote}>Copy quote</CopyButton>
            <CopyButton
              value={`“${proof.quote}” — ${proof.submission.respondentName || "Customer"}, ${proof.submission.respondentCompany || ""}`}
            >
              Copy card
            </CopyButton>
          </div>
        </div>

        <div className="mt-10 border border-[#dfdbd2] bg-white p-7 md:p-10">
          <p className="text-xs tracking-[.16em] text-[#726d63] uppercase">
            Extracted quote
          </p>
          <blockquote className="mt-5 text-3xl leading-tight tracking-[-.04em]">
            “{proof.quote}”
          </blockquote>
          <div className="mt-10 grid gap-6 border-t border-[#eeeae3] pt-6 sm:grid-cols-3">
            <Detail
              label="Permission"
              value={permissionLabels[proof.permission] || "Ask first"}
            />
            <Detail
              label="Captured"
              value={proof.createdAt.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            />
            <Detail
              label="Customer"
              value={proof.submission.respondentCompany || "—"}
            />
          </div>
        </div>

        <ProofEditor
          proof={{
            id: proof.id,
            quote: proof.quote,
            permission: proof.permission,
            impactMetric: proof.impactMetric,
            product: proof.product,
            useCase: proof.useCase,
            archived: proof.archived,
          }}
        />

        <section className="mt-14">
          <h2 className="text-xl font-semibold">Original answers</h2>
          <p className="mt-2 text-sm text-[#726d63]">
            Raw customer responses are preserved exactly as submitted.
          </p>
          <div className="mt-6 divide-y divide-[#dfdbd2] border-y border-[#dfdbd2]">
            {proof.submission.answers.map((answer) => (
              <div className="py-5" key={answer.id}>
                <p className="text-sm font-semibold">{answer.question.label}</p>
                <p className="mt-2 leading-7 whitespace-pre-wrap text-[#726d63]">
                  {formatAnswer(answer.question.type, answer.value)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function formatAnswer(type: string, value: unknown) {
  const rawValue = String(value);
  if (type !== "PERMISSION") return rawValue;
  return (
    permissionOptions.find(([permission]) => permission === rawValue)?.[1] ||
    "Please ask me before using it"
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs tracking-[.14em] text-[#726d63] uppercase">
        {label}
      </p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { permissionLabels } from "@/lib/templates";

type DashboardProps = {
  workspace: { name: string; _count: { proofs: number } };
  captures: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    _count: { submissions: number };
  }>;
  proofs: Array<{
    id: string;
    quote: string;
    product: string | null;
    permission: keyof typeof permissionLabels;
    impactMetric: string | null;
    createdAt: Date | string;
    tags: Array<{ tag: { name: string } }>;
    submission: {
      respondentName: string | null;
      respondentCompany: string | null;
    };
  }>;
};

const filters = [
  ["ALL", "All"],
  ["PUBLIC_FULL", "Public"],
  ["ASK_FIRST", "Ask first"],
  ["INTERNAL", "Internal"],
] as const;

export default function DashboardClient({
  workspace,
  captures,
  proofs,
}: DashboardProps) {
  const [filter, setFilter] = useState<(typeof filters)[number][0]>("ALL");
  const [search, setSearch] = useState("");
  const visibleProofs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return proofs.filter((proof) => {
      const matchesFilter =
        filter === "ALL" ||
        (filter === "PUBLIC_FULL"
          ? proof.permission.startsWith("PUBLIC_")
          : proof.permission === filter);
      const haystack = [
        proof.submission.respondentName,
        proof.submission.respondentCompany,
        proof.quote,
        proof.product,
        ...proof.tags.map(({ tag }) => tag.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesFilter && (!term || haystack.includes(term));
    });
  }, [filter, proofs, search]);

  return (
    <main className="min-h-screen bg-[#f5f1ea]">
      <header className="border-b border-[#ddd8ce] bg-[#f9f7f2]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-10">
          <Link
            href="/dashboard"
            className="text-2xl font-semibold tracking-[-.06em]"
          >
            proove.now
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-[#726d63] sm:inline">
              {workspace.name}
            </span>
            <Link href="/captures/new">
              <Button>New capture +</Button>
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm tracking-[.16em] text-[#b4540a] uppercase">
              Your proof library
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-.06em] md:text-6xl">
              Customer proof,
              <br />
              ready to use.
            </h1>
          </div>
          <label className="w-full md:max-w-xs">
            <span className="sr-only">Search proof cards</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search proof cards…"
              className="w-full rounded-md border border-[#cfc9be] bg-white px-4 py-3 text-sm outline-none focus:border-[#191815]"
            />
          </label>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <Metric label="Proof cards" value={workspace._count.proofs} />
          <Metric
            label="Responses"
            value={captures.reduce(
              (sum, capture) => sum + capture._count.submissions,
              0,
            )}
          />
          <Metric
            label="Live captures"
            value={
              captures.filter((capture) => capture.status === "PUBLISHED")
                .length
            }
          />
        </div>
        <section className="mt-14">
          <div className="flex flex-wrap items-center gap-2 border-b border-[#d9d4ca] pb-3">
            {filters.map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-full px-4 py-2 text-sm ${filter === value ? "bg-[#191815] text-white" : "text-[#726d63] hover:bg-white"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleProofs.map((proof) => (
              <ProofCard key={proof.id} proof={proof} />
            ))}
            {!visibleProofs.length && (
              <p className="text-sm text-[#726d63]">
                No proof cards match this view.
              </p>
            )}
          </div>
        </section>
        <section className="mt-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-[-.04em]">
              Captures
            </h2>
            <Link href="/captures/new" className="text-sm underline">
              Create a capture
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {captures.map((capture) => (
              <Link
                href={`/captures/${capture.id}`}
                key={capture.id}
                className="flex items-center justify-between border border-[#ddd8ce] bg-white px-5 py-4 hover:border-[#191815]"
              >
                <span className="font-medium">{capture.name}</span>
                <span className="text-sm text-[#726d63]">
                  {capture._count.submissions} responses ·{" "}
                  {capture.status.toLowerCase()}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#ddd8ce] bg-white p-5">
      <p className="text-sm text-[#726d63]">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function ProofCard({ proof }: { proof: DashboardProps["proofs"][number] }) {
  return (
    <Link
      href={`/proofs/${proof.id}`}
      className="group flex min-h-64 flex-col justify-between border border-[#ddd8ce] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#191815]"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <span className="text-xs tracking-[.14em] text-[#b4540a] uppercase">
            {permissionLabels[proof.permission]}
          </span>
          <span className="text-xs text-[#8b857b]">
            {new Date(proof.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="mt-5 text-lg leading-8">“{proof.quote}”</p>
        {proof.impactMetric && (
          <p className="mt-4 inline-block bg-[#f5e4d2] px-2 py-1 text-sm font-medium text-[#8d440e]">
            {proof.impactMetric}
          </p>
        )}
      </div>
      <div className="mt-6 border-t border-[#eee9e1] pt-4 text-sm text-[#726d63]">
        {[proof.submission.respondentName, proof.submission.respondentCompany]
          .filter(Boolean)
          .join(" · ") || "Anonymous"}
        {proof.product && ` · ${proof.product}`}
      </div>
    </Link>
  );
}

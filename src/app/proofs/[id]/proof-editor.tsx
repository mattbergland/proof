"use client";

import { useState } from "react";
import { Button, Field } from "@/components/ui";
import { permissionOptions } from "@/lib/templates";

type ProofEditorProps = {
  proof: {
    id: string;
    quote: string;
    permission: string;
    impactMetric: string | null;
    product: string | null;
    useCase: string | null;
    archived: boolean;
  };
};

export default function ProofEditor({ proof }: ProofEditorProps) {
  const [quote, setQuote] = useState(proof.quote);
  const [permission, setPermission] = useState(proof.permission);
  const [metric, setMetric] = useState(proof.impactMetric || "");
  const [product, setProduct] = useState(proof.product || "");
  const [useCase, setUseCase] = useState(proof.useCase || "");
  const [saved, setSaved] = useState(false);

  async function save(archive = false) {
    await fetch(`/api/proofs/${proof.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        quote,
        permission,
        impactMetric: metric,
        product,
        useCase,
        archived: archive,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  return (
    <section className="mt-10 border-t border-[#dfdbd2] pt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Proof Card fields</h2>
        {saved && <span className="text-sm text-[#b4540a]">Saved</span>}
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium md:col-span-2">
          Quote
          <textarea
            value={quote}
            onChange={(event) => setQuote(event.target.value)}
            className="min-h-24 border border-[#cfc9be] bg-white px-3 py-2.5 font-normal"
          />
        </label>
        <Field
          label="Impact metric"
          value={metric}
          onChange={(event) => setMetric(event.target.value)}
          placeholder="~40% faster migrations"
        />
        <Field
          label="Product"
          value={product}
          onChange={(event) => setProduct(event.target.value)}
          placeholder="Developer Platform"
        />
        <Field
          label="Use case"
          value={useCase}
          onChange={(event) => setUseCase(event.target.value)}
          placeholder="Migration"
        />
        <label className="grid gap-2 text-sm font-medium">
          Permission
          <select
            value={permission}
            onChange={(event) => setPermission(event.target.value)}
            className="border border-[#cfc9be] bg-white px-3 py-2.5 font-normal"
          >
            {permissionOptions.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-6 flex flex-wrap gap-4">
        <Button onClick={() => save()}>Save changes</Button>
        <button
          onClick={() => save(!proof.archived)}
          className="text-sm underline"
        >
          {proof.archived ? "Unarchive" : "Archive"}
        </button>
      </div>
    </section>
  );
}

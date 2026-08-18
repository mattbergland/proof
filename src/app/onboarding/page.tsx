"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Field } from "@/components/ui";
import { templates, typeLabels } from "@/lib/templates";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [captureType, setCaptureType] = useState("CUSTOMER_WIN");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const form = new FormData();
    form.set("name", name);
    form.set("website", website);
    form.set("captureType", captureType);
    if (logo) form.set("logo", logo);
    const response = await fetch("/api/onboarding", {
      method: "POST",
      body: form,
    });
    const result = await response.json();
    if (response.ok)
      router.push(
        result.captureSlug ? `/c/${result.captureSlug}` : "/dashboard",
      );
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <Link href="/" className="text-xl font-semibold tracking-[-.04em]">
        proove.now
      </Link>
      <div className="mt-20">
        <p className="text-sm tracking-[.16em] text-[#b4540a] uppercase">
          Set up your workspace
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-.06em]">
          {step === 1
            ? "Make proof part of the workflow."
            : "What would you like to capture?"}
        </h1>
        <p className="mt-5 text-lg leading-8 text-[#726d63]">
          {step === 1
            ? "A couple details, then you can send your first customer capture."
            : "Start with a focused format. You can adjust every question next."}
        </p>

        {step === 1 ? (
          <div className="mt-10 grid gap-5">
            <Field
              label="Company name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="Fieldline"
            />
            <Field
              label="Company website"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://fieldline.dev"
            />
            <label className="grid gap-2 text-sm font-medium">
              Company logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(event) => setLogo(event.target.files?.[0] || null)}
                className="rounded-md border border-[#cfc9be] bg-white px-3 py-2.5 text-sm font-normal"
              />
              <span className="text-xs font-normal text-[#726d63]">
                Optional. PNG, JPG, WebP, or SVG.
              </span>
            </label>
            <Button disabled={!name.trim()} onClick={() => setStep(2)}>
              Continue →
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {Object.keys(typeLabels).map((type) => (
                <button
                  key={type}
                  onClick={() => setCaptureType(type)}
                  className={`border p-5 text-left transition ${captureType === type ? "border-[#191815] bg-white" : "border-[#dfdbd2]"}`}
                >
                  <span className="font-semibold">{typeLabels[type]}</span>
                  <span className="mt-2 block text-sm text-[#726d63]">
                    {templates[type][0].label}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={() => setStep(1)} className="text-sm underline">
                ← Back
              </button>
              <Button disabled={busy} onClick={submit}>
                {busy ? "Setting up…" : "Create my first capture →"}
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

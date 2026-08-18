"use client";
import { useEffect, useState } from "react";
import { Header, Button, Field } from "@/components/ui";
export default function Integrations() {
  const [webhook, setWebhook] = useState("");
  const [slack, setSlack] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    fetch("/api/settings/integrations")
      .then((r) => r.json())
      .then((d) => {
        setWebhook(d.webhook || "");
        setSlack(d.slack || "");
      });
  }, []);
  return (
    <main>
      <Header />
      <div className="mx-auto max-w-2xl px-5 py-12 md:px-10">
        <p className="text-sm tracking-[.16em] text-[#b4540a] uppercase">
          Settings
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-.05em]">
          Route new proof
        </h1>
        <p className="mt-4 text-[#726d63]">
          Send a clean notification payload wherever your team works.
        </p>
        <div className="mt-10 grid gap-8">
          <div className="border-t border-[#dfdbd2] pt-6">
            <h2 className="text-xl font-semibold">Webhook</h2>
            <p className="mt-2 text-sm text-[#726d63]">
              POST a JSON payload when a new Proof Card is created.
            </p>
            <div className="mt-5">
              <Field
                label="Webhook URL"
                value={webhook}
                onChange={(e) => setWebhook(e.target.value)}
                placeholder="https://example.com/hooks/proof"
              />
            </div>
          </div>
          <div className="border-t border-[#dfdbd2] pt-6">
            <h2 className="text-xl font-semibold">Slack</h2>
            <p className="mt-2 text-sm text-[#726d63]">
              Use a Slack incoming webhook URL.
            </p>
            <div className="mt-5">
              <Field
                label="Slack webhook URL"
                value={slack}
                onChange={(e) => setSlack(e.target.value)}
                placeholder="https://hooks.slack.com/services/…"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={async () => {
                await fetch("/api/settings/integrations", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ webhook, slack }),
                });
                setSaved(true);
                setTimeout(() => setSaved(false), 1200);
              }}
            >
              Save integrations
            </Button>
            {saved && <span className="text-sm text-[#b4540a]">Saved</span>}
          </div>
        </div>
      </div>
    </main>
  );
}

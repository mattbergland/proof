import { db } from "./db";
export function buildNotificationPayload(proof: {
  id: string;
  quote: string;
  permission: string;
  submission: {
    respondentName: string | null;
    respondentTitle: string | null;
    respondentCompany: string | null;
  };
  workspace: { name: string };
}) {
  return {
    event: "proof.created",
    proofId: proof.id,
    company: proof.workspace.name,
    respondent: [
      proof.submission.respondentName,
      proof.submission.respondentTitle,
    ]
      .filter(Boolean)
      .join(" — "),
    respondentCompany: proof.submission.respondentCompany,
    quote: proof.quote,
    permission: proof.permission,
    viewUrl: `/proofs/${proof.id}`,
  };
}
export async function notifyProof(workspaceId: string, payload: object) {
  const integrations = await db.integration.findMany({
    where: { workspaceId, enabled: true },
  });
  for (const i of integrations) {
    const c = i.config as { url?: string };
    if ((i.type === "WEBHOOK" || i.type === "SLACK") && c.url)
      fetch(c.url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          i.type === "SLACK"
            ? { text: `New customer proof 🎉\n${JSON.stringify(payload)}` }
            : payload,
        ),
      }).catch(() => undefined);
    else console.log("proove.now notification", payload);
  }
}

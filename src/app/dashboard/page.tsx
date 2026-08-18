import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import DashboardClient from "@/components/dashboard-client";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!user.workspaceId) redirect("/onboarding");
  const [workspace, captures, proofs] = await Promise.all([
    db.workspace.findUnique({
      where: { id: user.workspaceId },
      include: { _count: { select: { proofs: true } } },
    }),
    db.capture.findMany({
      where: { workspaceId: user.workspaceId },
      include: { _count: { select: { submissions: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.proof.findMany({
      where: { workspaceId: user.workspaceId },
      include: {
        tags: { include: { tag: true } },
        submission: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  if (!workspace) redirect("/onboarding");
  return (
    <DashboardClient
      workspace={workspace}
      captures={captures}
      proofs={proofs}
    />
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { Button, Header } from "@/components/ui";

export default async function CaptureEdit({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  const { id } = await params;
  const capture = await db.capture.findUnique({ where: { id }, include: { questions: true } });
  if (!capture || !user || capture.workspaceId !== user.workspaceId) notFound();
  return <main><Header workspace={user.workspace?.name} /><div className="mx-auto max-w-2xl px-5 py-12 md:px-10">
    <p className="text-sm uppercase tracking-[.16em] text-[#b4540a]">Capture settings</p>
    <h1 className="mt-3 text-4xl font-semibold tracking-[-.05em]">{capture.name}</h1>
    <p className="mt-4 text-[#726d63]">This capture is {capture.status.toLowerCase()}. Share its public link or export responses.</p>
    <div className="mt-8 flex flex-wrap gap-3"><Link href={`/c/${capture.slug}`}><Button>Open public capture</Button></Link><a href={`/api/captures/${capture.id}/export`} className="rounded-md border border-[#bdb7ac] px-4 py-2.5 text-sm font-medium">Export CSV</a></div>
    <h2 className="mt-12 text-xl font-semibold">Questions</h2>
    <div className="mt-4 divide-y divide-[#dfdbd2] border-y border-[#dfdbd2]">{capture.questions.sort((a,b)=>a.order-b.order).map((q,i)=><div className="py-4" key={q.id}><span className="mr-3 text-sm text-[#726d63]">{i+1}</span>{q.label}</div>)}</div>
  </div></main>;
}

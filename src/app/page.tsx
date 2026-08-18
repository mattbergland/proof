import Link from "next/link";
import { db } from "@/lib/db";
import { Button, Header } from "@/components/ui";

export default async function Home() {
  const demo = await db.capture.findUnique({ where: { slug: "fieldline-customer-win" } }).catch(() => null);
  return <main>
    <Header action={<Link href="/login" className="text-[#191815]">Sign in</Link>} />
    <section className="mx-auto grid max-w-6xl gap-14 px-6 pb-24 pt-20 md:grid-cols-[1.1fr_.9fr] md:items-center md:px-10 md:pt-28">
      <div><p className="mb-7 text-sm font-medium uppercase tracking-[.18em] text-[#b4540a]">Customer proof, without the busywork</p><h1 className="max-w-2xl text-5xl font-semibold leading-[.98] tracking-[-.06em] md:text-7xl">Turn happy customers into usable proof.</h1><p className="mt-7 max-w-xl text-lg leading-8 text-[#726d63]">Collect testimonials, customer wins, metrics, and case study leads with beautiful forms your customers can finish in under two minutes.</p><div className="mt-9 flex flex-wrap gap-4"><Link href="/onboarding"><Button>Collect your first proof</Button></Link><Link href={demo ? `/c/${demo.slug}` : "/login"} className="rounded-md border border-[#bdb7ac] px-4 py-2.5 text-sm font-medium">See an example</Link></div></div>
      <div className="border border-[#dfdbd2] bg-white p-5 md:p-8"><div className="flex items-center justify-between border-b border-[#e7e3db] pb-5"><span className="font-semibold">proove.now</span><span className="text-xs text-[#726d63]">Customer win</span></div><div className="py-10"><p className="text-xs uppercase tracking-[.16em] text-[#b4540a]">A quick question</p><h2 className="mt-4 text-3xl font-semibold tracking-[-.04em]">What changed after using Fieldline?</h2><div className="mt-8 h-24 border-b border-[#191815] text-[#a49e93]">Write your answer…</div></div><div className="flex justify-end"><span className="bg-[#191815] px-5 py-3 text-sm text-white">Continue →</span></div></div>
    </section>
    <section className="border-y border-[#dfdbd2] bg-white px-6 py-20 md:px-10"><div className="mx-auto max-w-6xl"><p className="text-sm font-medium uppercase tracking-[.18em] text-[#726d63]">Create → Share → Capture → Use</p><div className="mt-10 grid gap-8 md:grid-cols-4">{[["01","Send a beautiful capture","A focused request that feels good to answer."],["02","Customer responds","One question at a time, on any device."],["03","Proof appears","Every response becomes a usable Proof Card."],["04","Use it anywhere","Copy the quote, export it, or route it to your team."]].map(([n,t,d])=><div key={n} className="border-t-2 border-[#191815] pt-4"><p className="text-sm text-[#b4540a]">{n}</p><h3 className="mt-4 text-xl font-semibold tracking-[-.03em]">{t}</h3><p className="mt-3 text-sm leading-6 text-[#726d63]">{d}</p></div>)}</div></div></section>
    <section className="mx-auto max-w-6xl px-6 py-20 md:px-10"><div className="max-w-2xl"><h2 className="text-4xl font-semibold tracking-[-.05em]">Your customers have already said the good stuff.</h2><p className="mt-5 text-lg leading-8 text-[#726d63]">Praise gets lost in calls, Slack messages, events, support conversations, and emails. proove.now makes it easy to follow up while the moment is fresh.</p></div></section>
    <footer className="border-t border-[#dfdbd2] px-6 py-8 text-sm text-[#726d63] md:px-10">proove.now · Customer proof, made usable.</footer>
  </main>;
}

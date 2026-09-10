/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const proofData = [
  [
    "Jane Smith",
    "VP Engineering",
    "Northstar",
    "Using Fieldline changed how our team handles migrations. What previously took several days now happens in hours.",
    "~40% faster migrations",
    "PUBLIC_FULL",
  ],
  [
    "Marcus Lee",
    "Head of Platform",
    "Cinder",
    "Our incident reviews went from scattered notes to a repeatable operating rhythm the whole team can trust.",
    "2x faster incident reviews",
    "PUBLIC_COMPANY",
  ],
  [
    "Priya Raman",
    "Director of Product",
    "Orbit Labs",
    "Fieldline gave us the evidence to focus our roadmap on the work customers actually feel.",
    "18% higher feature adoption",
    "PUBLIC_ANON",
  ],
  [
    "Theo Martin",
    "Founder",
    "Anchor Systems",
    "We finally have one calm place to see what is happening across every service.",
    "",
    "INTERNAL",
  ],
  [
    "Olivia Chen",
    "Customer Success Lead",
    "Tandem",
    "The rollout was simple enough for a small team, but the visibility feels enterprise-grade.",
    "3 weeks saved at launch",
    "ASK_FIRST",
  ],
  [
    "Elias Brown",
    "Staff Engineer",
    "Sonder",
    "Before Fieldline, every deployment was a guessing game. Now the signal is right where the team needs it.",
    "27% fewer rollback events",
    "PUBLIC_FULL",
  ],
  [
    "Nadia Wilson",
    "VP Operations",
    "Harbor",
    "We spend less time reconciling reports and more time acting on the patterns they reveal.",
    "6 hours back each week",
    "PUBLIC_COMPANY",
  ],
  [
    "Samir Patel",
    "Engineering Manager",
    "Morrow",
    "Fieldline helped us make reliability a shared practice instead of a specialist concern.",
    "",
    "PUBLIC_FULL",
  ],
  [
    "Grace Kim",
    "Product Marketing",
    "Verge",
    "The customer stories we used to lose in Slack now become proof the whole team can use.",
    "",
    "ASK_FIRST",
  ],
  [
    "Noah Williams",
    "CTO",
    "Daybreak",
    "The clarity is the product. Every decision starts from the same source of truth.",
    "35% faster weekly planning",
    "PUBLIC_ANON",
  ],
];
async function main() {
  const workspace = await db.workspace.upsert({
    where: { slug: "fieldline" },
    update: { name: "Fieldline", websiteUrl: "https://fieldline.dev" },
    create: {
      name: "Fieldline",
      slug: "fieldline",
      websiteUrl: "https://fieldline.dev",
    },
  });
  const user = await db.user.upsert({
    where: { email: "demo@fieldline.dev" },
    update: { workspaceId: workspace.id, name: "Fieldline Demo" },
    create: {
      email: "demo@fieldline.dev",
      name: "Fieldline Demo",
      workspaceId: workspace.id,
    },
  });
  let capture = await db.capture.findUnique({
    where: { slug: "fieldline-customer-win" },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!capture)
    capture = await db.capture.create({
      data: {
        workspaceId: workspace.id,
        type: "CUSTOMER_WIN",
        name: "Customer Win",
        slug: "fieldline-customer-win",
        status: "PUBLISHED",
        introHeadline: "We’d love to hear about your experience.",
        introBody: "This should only take about 90 seconds.",
        thankYouMessage: "Thanks for sharing your experience with Fieldline.",
        questions: {
          create: [
            {
              label: "What were you trying to accomplish?",
              order: 0,
              type: "LONG_TEXT",
            },
            {
              label: "How were you handling this before?",
              order: 1,
              type: "LONG_TEXT",
            },
            {
              label: "What’s changed since using Fieldline?",
              order: 2,
              type: "LONG_TEXT",
            },
            {
              label: "Can you put a number on the impact?",
              order: 3,
              type: "NUMBER",
            },
            {
              label: "What would you tell someone considering Fieldline?",
              order: 4,
              type: "LONG_TEXT",
            },
            {
              label: "How can we use your response?",
              order: 5,
              type: "PERMISSION",
            },
          ],
        },
      },
    });
  const count = await db.proof.count({ where: { workspaceId: workspace.id } });
  if (count === 0) {
    for (const [name, title, company, quote, metric, permission] of proofData) {
      await db.submission.create({
        data: {
          captureId: capture.id,
          respondentName: name,
          respondentTitle: title,
          respondentCompany: company,
          permission,
          status: "COMPLETE",
          answers: {
            create: capture.questions.map((q, i) => ({
              questionId: q.id,
              value:
                i === 2 ? quote : i === 3 ? metric : i === 5 ? permission : "",
            })),
          },
          proof: {
            create: {
              workspaceId: workspace.id,
              quote,
              impactMetric: metric || null,
              product: "Fieldline",
              useCase: "Operations",
              permission,
            },
          },
        },
      });
    }
  }
  console.log(
    `Seeded Fieldline workspace (${user.email}) with ${proofData.length} Proof Cards and demo capture.`,
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

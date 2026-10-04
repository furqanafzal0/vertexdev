import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { siteContentQuery } from "@/lib/content";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Vertex Dev" },
      { name: "description", content: "Founded in 2021 by Abdurehman Kazim and Furqan Afzal. A small studio where you work directly with the founders." },
      { property: "og:title", content: "About Vertex Dev" },
      { property: "og:description", content: "A two-founder web design & development studio since 2021." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  component: About,
});

const reasons = [
  ["First impressions", "Most customers see your website before they ever see you."],
  ["Credibility", "A sharp, modern site tells people you're a real, serious business."],
  ["Found online", "When people search for what you sell, you need to show up."],
  ["Open 24/7", "Your products and services stay on display, even while you sleep."],
  ["Easy to reach", "One tap to call, WhatsApp or email — no hunting for a number."],
  ["More customers", "A clear site turns curious visitors into real enquiries."],
];

function About() {
  const { data: c } = useSuspenseQuery(siteContentQuery);
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-20 sm:pb-14 sm:pt-28">
        <span className="font-condensed text-2xl">EST. 2021</span>
        <h1 className="mt-2 leading-[0.9]">
          <span className="block font-display text-6xl uppercase sm:text-8xl">Two founders.</span>
          <span className="block font-wide text-5xl uppercase sm:text-7xl">Zero handoffs.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-xl leading-relaxed">{c.about_intro}</p>
      </section>
      <section className="mx-auto max-w-6xl px-5 pt-10 sm:pt-14">
        <Reveal>
          <h2 className="font-display text-4xl uppercase sm:text-5xl">Our story.</h2>
          <div className="mt-5 max-w-2xl space-y-4 leading-relaxed text-muted-foreground">
            <p>Vertex Dev was founded in 2021 by Abdurehman Kazim and Furqan Afzal — one focused on solid, fast development, the other on design and the client experience.</p>
            <p>Since then we've designed and built websites and digital projects for car showrooms, clothing brands, food businesses and local companies. We've stayed small on purpose, so every client works directly with the two people building their site.</p>
          </div>
        </Reveal>
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:pb-20 sm:pt-14">
        <Reveal>
          <h2 className="font-display text-4xl uppercase sm:text-5xl">Why your business needs a website.</h2>
        </Reveal>
        <div className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(([t = "", d], i) => (
            <Reveal key={t} delay={i * 60}>
              <h3 className="font-condensed text-xl tracking-wide">{t.toUpperCase()}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

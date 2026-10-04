import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { coverFor, projectQuery } from "@/lib/content";
import { Reveal } from "@/components/site/Reveal";
import { useContact } from "@/components/site/ContactDialog";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(projectQuery(params.slug));
    if (!p) throw notFound();
    return { title: p.title, summary: p.summary, cover: p.cover_url };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.title} — Case study | Vertex Dev` : "Case study | Vertex Dev";
    const d = loaderData?.summary || "A Vertex Dev website case study.";
    const meta = [
      { title: t },
      { name: "description", content: d },
      { property: "og:title", content: t },
      { property: "og:description", content: d },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (loaderData?.cover?.startsWith("https://")) {
      meta.push({ property: "og:image", content: loaderData.cover }, { name: "twitter:image", content: loaderData.cover });
    }
    return { meta };
  },
  component: CaseStudy,
});

function Point({ label, text }: { label: string; text: string }) {
  if (!text) return null;
  return (
    <div>
      <h2 className="font-condensed text-lg tracking-wide">{label.toUpperCase()}</h2>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function CaseStudy() {
  const { slug } = Route.useParams();
  const { data: p } = useSuspenseQuery(projectQuery(slug));
  const { open } = useContact();
  if (!p) return null;
  return (
    <article className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <Link to="/projects" className="text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground">← All projects</Link>
      <h1 className="mt-6 font-display text-6xl uppercase sm:text-8xl">{p.title}</h1>
      <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3 text-sm">
        {[["Industry", p.industry], ["Client", p.client], ["Year", p.year?.toString()]].filter(([, v]) => v).map(([k, v]) => (
          <div key={k}><dt className="uppercase tracking-wider text-muted-foreground">{k}</dt><dd className="font-semibold">{v}</dd></div>
        ))}
      </dl>
      <div className="device-frame mt-10">
        <img src={coverFor(p)} alt={`${p.title} homepage`} width={1280} height={800} className="w-full rounded-[0.7rem]" />
      </div>
      {p.live_url && (
        <a href={p.live_url} target="_blank" rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-condensed text-lg tracking-wide text-primary-foreground transition hover:-translate-y-0.5">
          VISIT WEBSITE →
        </a>
      )}
      <Reveal>
        <div className="mt-12 grid max-w-4xl gap-x-12 gap-y-7 sm:grid-cols-2">
          <Point label="Overview" text={p.overview} />
          <Point label="Challenge" text={p.challenge} />
          <Point label="Solution" text={p.approach} />
          <Point label="Design" text={p.design_process} />
          <Point label="Development" text={p.dev_process} />
          <Point label="Result" text={p.result} />
        </div>
        {p.features.length > 0 && (
          <div className="mt-8">
            <h2 className="font-condensed text-lg tracking-wide">KEY FEATURES</h2>
            <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm text-muted-foreground sm:grid-cols-2">
              {p.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
          </div>
        )}
        {p.technologies.length > 0 && (
          <div className="mt-8">
            <h2 className="font-condensed text-lg tracking-wide">BUILT WITH</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {p.technologies.map((t) => <span key={t} className="rounded-full border border-foreground px-3 py-0.5 text-xs font-semibold">{t}</span>)}
            </div>
          </div>
        )}
      </Reveal>
      {p.gallery.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-3xl uppercase">Gallery</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {p.gallery.map((src, i) => (
              <div key={src} className={`device-frame ${i === 0 ? "sm:col-span-2" : ""}`}>
                <img src={src} alt={`${p.title} screenshot ${i + 1}`} loading="lazy" className="w-full rounded-[0.7rem]" />
              </div>
            ))}
          </div>
        </section>
      )}
      <div className="mt-16 flex flex-wrap items-center justify-center gap-4 border-t border-border pt-8 text-center">
        <p className="text-sm text-muted-foreground">Want one like this?</p>
        <button onClick={() => open()} className="rounded-full bg-primary px-5 py-2 font-condensed text-base tracking-wide text-primary-foreground transition hover:-translate-y-0.5">START A PROJECT</button>
      </div>
    </article>
  );
}

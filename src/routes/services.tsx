import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { servicesQuery, siteContentQuery } from "@/lib/content";
import { Reveal } from "@/components/site/Reveal";
import { Process } from "@/components/site/Process";
import { useContact } from "@/components/site/ContactDialog";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Vertex Dev" },
      { name: "description", content: "Car showroom websites, e-commerce stores, business websites and ongoing website management." },
      { property: "og:title", content: "Services — Vertex Dev" },
      { property: "og:description", content: "Showroom, e-commerce and business websites — plus full website management." },
    ],
  }),
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(servicesQuery),
    context.queryClient.ensureQueryData(siteContentQuery),
  ]),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: c } = useSuspenseQuery(siteContentQuery);
  const { open } = useContact();
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-20 sm:pt-28">
        <h1 className="leading-[0.9]">
          <span className="block font-display text-6xl uppercase sm:text-8xl">What we</span>
          <span className="block font-wide text-6xl uppercase sm:text-8xl">Build</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Car showrooms are our speciality — but we build for any business that wants to look sharp online.
          Manage your own content, or let us handle it.
        </p>
      </section>
      <section className="mx-auto max-w-6xl space-y-8 px-5 py-12">
        {services.map((s, i) => (
          <Reveal key={s.id}>
            <div className={`grid gap-8 rounded-[2rem] p-7 sm:p-10 md:grid-cols-[1fr_1.3fr] ${i === 0 ? "bg-primary text-primary-foreground" : "bg-card"}`}>
              <div>
                <span className="font-condensed text-xl tracking-wide opacity-70">{String(i + 1).padStart(2, "0")} / {s.tagline}</span>
                <h2 className="mt-2 font-display text-4xl uppercase sm:text-5xl">{s.title}</h2>
                <p className="mt-4 opacity-80">{s.description}</p>
                {s.image_url && <img src={s.image_url} alt={s.title} loading="lazy" className="mt-6 w-full rounded-2xl" />}
                <button onClick={() => open()} className={`mt-6 rounded-full px-5 py-2 font-condensed text-lg tracking-wide ${i === 0 ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"}`}>
                  ENQUIRE
                </button>
              </div>
              <ul className="grid content-start gap-2 sm:grid-cols-2">
                {s.features.map((f) => (
                  <li key={f} className="rounded-xl border-2 border-current/20 px-4 py-3 text-sm font-semibold">{f}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </section>
      <Process text={c.process} />
    </>
  );
}

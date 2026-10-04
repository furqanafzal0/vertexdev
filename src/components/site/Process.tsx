import { Reveal } from "./Reveal";

export function Process({ text }: { text?: string | undefined }) {
  const steps = (text || "").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [t, ...rest] = l.split(/\s[—-]\s/);
    return { title: t, body: rest.join(" — ") };
  });
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <h2 className="font-display text-5xl uppercase sm:text-6xl">How we work.</h2>
      <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((s, i) => (
          <Reveal key={i} delay={i * 80}>
            <li className="h-full rounded-3xl border-[3px] border-foreground p-6">
              <span className="font-wide text-4xl">0{i + 1}</span>
              <h3 className="mt-4 font-display text-2xl uppercase">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

import { Link } from "@tanstack/react-router";
import { coverFor, type Project } from "@/lib/content";

export function ProjectCard({ p, eager }: { p: Project; eager?: boolean }) {
  return (
    <Link to="/projects/$slug" params={{ slug: p.slug }} className="group block">
      <div className="device-frame overflow-hidden transition duration-300 group-hover:-translate-y-1 group-hover:-rotate-1">
        <img src={coverFor(p)} alt={`${p.title} website preview`} width={1280} height={800}
          loading={eager ? "eager" : "lazy"} className="aspect-[16/10] w-full rounded-[0.7rem] object-cover" />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-2xl uppercase">{p.title}</h3>
        {p.year && <span className="shrink-0 text-xs text-muted-foreground">{p.year}</span>}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{p.industry}</p>
      <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p>
      <span className="mt-3 inline-block font-display text-sm uppercase underline underline-offset-4">View case study →</span>
    </Link>
  );
}

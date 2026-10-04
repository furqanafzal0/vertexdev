import { Star } from "lucide-react";
import type { Review } from "@/lib/content";
import { Reveal } from "./Reveal";

export function Reviews({ reviews }: { reviews: Review[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {reviews.map((r, i) => (
        <Reveal key={r.id} delay={(i % 2) * 120}>
          <figure className="h-full rounded-3xl bg-card p-6 sm:p-8">
            <div className="flex justify-end gap-0.5 text-star">
              {Array.from({ length: r.rating }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}
            </div>
            <blockquote className="mt-3 text-lg leading-relaxed">“{r.body}”</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              {r.avatar_url ? (
                <img src={r.avatar_url} alt={r.client_name} className="h-10 w-10 shrink-0 rounded-full object-cover" loading="lazy" />
              ) : (
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary font-display text-primary-foreground">
                  {r.client_name.replace("Placeholder — ", "").charAt(0)}
                </span>
              )}
              <span className="min-w-0">
                <span className="block font-semibold">{r.client_name}</span>
                <span className="block text-sm text-muted-foreground">{r.company}</span>
              </span>
            </figcaption>
          </figure>
        </Reveal>
      ))}
    </div>
  );
}

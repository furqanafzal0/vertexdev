import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { projectsQuery, reviewsQuery, siteContentQuery } from "@/lib/content";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reviews } from "@/components/site/Reviews";
import { Reveal } from "@/components/site/Reveal";
import heroHeading from "@/assets/hero-heading.png";
import scrollIcon from "@/assets/scroll-icon.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vertex Dev — We make websites, with no BS" },
      { name: "description", content: "Independent web design & development studio. Showroom, e-commerce and business websites built by the founders themselves." },
      { property: "og:title", content: "Vertex Dev — We make websites, with no BS" },
      { property: "og:description", content: "Independent web design & development studio since 2021." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(projectsQuery),
      context.queryClient.ensureQueryData(reviewsQuery),
      context.queryClient.ensureQueryData(siteContentQuery),
    ]),
  component: Home,
});

function Home() {
  const { data: projects } = useSuspenseQuery(projectsQuery);
  const { data: reviews } = useSuspenseQuery(reviewsQuery);
  const featured = (projects.filter((p) => p.featured).length ? projects.filter((p) => p.featured) : projects).slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col items-center justify-center overflow-hidden px-5 py-6 md:overflow-visible md:block md:min-h-0 md:pb-16 md:pt-14">
        <h1 className="sr-only">We make websites — with no BS</h1>
        <img src={heroHeading} alt="We make websites, with no BS" width={1920} height={1080}
          className="-mx-[47.5%] w-[195%] max-w-none shrink-0 md:mx-auto md:w-full md:max-w-3xl" />
        <a href="#projects" aria-label="See our projects"
          className="mx-auto -mt-16 block w-32 transition hover:scale-105 md:absolute md:bottom-10 md:right-10 md:mt-0">
          <img src={scrollIcon} alt="Our projects" width={1080} height={1080} className="h-auto w-full" />
        </a>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:py-28">
        <Reveal><h2 className="font-display text-5xl uppercase sm:text-6xl">Projects.</h2></Reveal>
        <div className="mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => <Reveal key={p.id} delay={i * 100}><ProjectCard p={p} eager={i === 0} /></Reveal>)}
        </div>
        <div className="mt-14 text-center">
          <Link to="/projects" className="font-display text-lg uppercase underline underline-offset-4 hover:no-underline">More projects</Link>
        </div>
      </section>

      <div className="brush-line mx-auto max-w-4xl" />

      {/* REVIEWS */}
      <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
        <Reveal>
          <h2 className="flex items-center gap-3 font-display text-5xl uppercase sm:text-6xl">
            Reviews <Star className="h-10 w-10 fill-star text-star" />
          </h2>
        </Reveal>
        <div className="mt-12"><Reviews reviews={reviews} /></div>
      </section>

    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { projectsQuery } from "@/lib/content";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Vertex Dev" },
      { name: "description", content: "Showroom, e-commerce and business websites designed and built by Vertex Dev." },
      { property: "og:title", content: "Projects — Vertex Dev" },
      { property: "og:description", content: "Selected website work from the Vertex Dev studio." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsQuery),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: projects } = useSuspenseQuery(projectsQuery);
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
      <h1 className="font-display text-6xl uppercase sm:text-8xl">All projects.</h1>
      <p className="mt-4 max-w-lg text-muted-foreground">Every site here was designed and built in-house by the two of us.</p>
      <div className="brush-line mt-12" />
      <div className="mt-14 grid gap-14 sm:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal key={p.id} delay={(i % 2) * 120} className={i % 2 ? "sm:mt-20" : ""}>
            <ProjectCard p={p} eager={i < 2} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

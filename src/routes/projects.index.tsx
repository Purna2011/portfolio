import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteLayout } from "@/components/site/site-chrome";
import { publicQueries } from "@/lib/portfolio";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Raavi Purna Satya Kumar" },
      {
        name: "description",
        content:
          "Analytics and data projects: SQL reporting, Power BI dashboards, Python analysis and machine learning work.",
      },
      { property: "og:title", content: "Projects — Raavi Purna Satya Kumar" },
      {
        property: "og:description",
        content: "SQL, Power BI, Python and machine learning projects with context and results.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: projects = [], isLoading } = useQuery(publicQueries.publishedProjects());
  const [filter, setFilter] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];
  const shown = filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-5 pt-16 pb-6">
        <h1 className="text-3xl">Projects</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Each one started with a question someone needed answered. Notes on the data, the
          approach and what actually came out of it.
        </p>

        {categories.length > 1 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-md border px-3 py-1.5 font-mono text-xs transition-colors ${
                  filter === c
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-5 pb-10">
        {isLoading ? (
          <p className="py-10 text-sm text-muted-foreground">Loading…</p>
        ) : shown.length === 0 ? (
          <p className="py-10 text-sm text-muted-foreground">No projects published yet.</p>
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {shown.map((p) => (
              <Link
                key={p.id}
                to="/projects/$slug"
                params={{ slug: p.slug }}
                className="group grid gap-4 py-7 transition-colors hover:bg-surface/60 sm:grid-cols-[1fr_auto]"
              >
                <div className="min-w-0">
                  <p className="label-mono">{p.category}</p>
                  <h2 className="mt-1.5 text-lg font-medium group-hover:text-primary">{p.name}</h2>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    {p.short_description}
                  </p>
                  {p.technologies.length > 0 && (
                    <p className="mt-3 font-mono text-xs text-muted-foreground">
                      {p.technologies.join(" · ")}
                    </p>
                  )}
                </div>
                {p.cover_image ? (
                  <img
                    src={p.cover_image}
                    alt={p.name}
                    loading="lazy"
                    className="h-24 w-full rounded-md object-cover sm:w-40"
                  />
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

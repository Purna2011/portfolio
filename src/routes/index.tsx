import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { SiteLayout } from "@/components/site/site-chrome";
import { publicQueries } from "@/lib/portfolio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Raavi Purna Satya Kumar — Data & Product Analyst" },
      {
        name: "description",
        content:
          "Portfolio of a data and product analyst working with SQL, Python and Power BI. Selected projects, experience and contact details.",
      },
      { property: "og:title", content: "Raavi Purna Satya Kumar — Data & Product Analyst" },
      {
        property: "og:description",
        content: "Selected analytics projects, experience and contact details.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: profile } = useQuery(publicQueries.profile());
  const { data: projects = [] } = useQuery(publicQueries.publishedProjects());
  const { data: skills = [] } = useQuery(publicQueries.skills());
  const { data: experience = [] } = useQuery(publicQueries.experience());
  const { data: resume } = useQuery(publicQueries.activeResume());

  const featured = projects.filter((p) => p.featured);
  const skillGroups = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    const key = s.category || "Other";
    (acc[key] ??= []).push(s);
    return acc;
  }, {});

  return (
    <SiteLayout>
      {/* Intro */}
      <section className="mx-auto max-w-5xl px-5 pt-16 pb-14 sm:pt-24">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="max-w-2xl">
            {profile?.open_to_work ? (
              <p className="mb-5 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Open to analyst roles
              </p>
            ) : null}
            <h1 className="text-3xl leading-tight sm:text-[2.6rem]">
              {profile?.headline || "I turn messy data into clear answers people can act on."}
            </h1>
            <p className="mt-5 text-base text-muted-foreground">
              {profile?.short_bio ||
                "Data & Product Analyst working with SQL, Python and Power BI."}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/projects"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                See my work
              </Link>
              {resume?.file_url ? (
                <a
                  href={resume.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  Download resume
                </a>
              ) : null}
              {profile?.email ? (
                <a
                  href={`mailto:${profile.email}`}
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  {profile.email}
                </a>
              ) : null}
            </div>
          </div>

          {profile?.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.full_name}
              className="h-32 w-32 rounded-md object-cover md:h-40 md:w-40"
            />
          ) : null}
        </div>
      </section>

      {/* Featured work */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-5xl border-t border-border px-5 py-14">
          <div className="flex items-baseline justify-between">
            <h2 className="label-mono">Selected work</h2>
            <Link
              to="/projects"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              All projects →
            </Link>
          </div>
          <div className="mt-7 divide-y divide-border border-y border-border">
            {featured.map((p) => (
              <Link
                key={p.id}
                to="/projects/$slug"
                params={{ slug: p.slug }}
                className="group flex flex-col gap-2 py-6 transition-colors hover:bg-surface/60 sm:flex-row sm:items-baseline sm:gap-8"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-1.5 text-lg font-medium">
                    {p.name}
                    <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.short_description}</p>
                </div>
                <p className="font-mono text-xs text-muted-foreground sm:w-56 sm:shrink-0 sm:text-right">
                  {p.technologies.slice(0, 4).join(" · ")}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mx-auto max-w-5xl border-t border-border px-5 py-14">
          <h2 className="label-mono">What I work with</h2>
          <dl className="mt-7 grid gap-6 sm:grid-cols-2">
            {Object.entries(skillGroups).map(([group, items]) => (
              <div key={group}>
                <dt className="text-sm font-medium">{group}</dt>
                <dd className="mt-1.5 font-mono text-sm text-muted-foreground">
                  {items.map((s) => s.name).join(", ")}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mx-auto max-w-5xl border-t border-border px-5 py-14">
          <h2 className="label-mono">Experience</h2>
          <ol className="mt-7 space-y-8">
            {experience.map((e) => (
              <li key={e.id} className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:gap-8">
                <p className="font-mono text-xs text-muted-foreground sm:pt-1">
                  {[e.start_date, e.end_date].filter(Boolean).join(" — ")}
                </p>
                <div>
                  <h3 className="font-medium">
                    {e.title}
                    {e.organization ? (
                      <span className="text-muted-foreground"> · {e.organization}</span>
                    ) : null}
                  </h3>
                  {e.description ? (
                    <p className="mt-1.5 text-sm text-muted-foreground">{e.description}</p>
                  ) : null}
                  {e.achievements.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                      {e.achievements.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mx-auto max-w-5xl border-t border-border px-5 py-14">
        <h2 className="text-xl">Got something you want measured?</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          I'm happy to talk through analytics problems, dashboards, or a role you're hiring for.
        </p>
        <Link
          to="/contact"
          className="mt-5 inline-flex rounded-md border border-border px-4 py-2 text-sm hover:border-primary hover:text-primary"
        >
          Get in touch
        </Link>
      </section>
    </SiteLayout>
  );
}

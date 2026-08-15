import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/site-chrome";
import { publicQueries } from "@/lib/portfolio";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Raavi Purna Satya Kumar" },
      {
        name: "description",
        content:
          "Background, education and certifications of a data and product analyst working with SQL, Python and Power BI.",
      },
      { property: "og:title", content: "About — Raavi Purna Satya Kumar" },
      {
        property: "og:description",
        content: "Background, education and certifications.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: profile } = useQuery(publicQueries.profile());
  const { data: education = [] } = useQuery(publicQueries.education());
  const { data: certifications = [] } = useQuery(publicQueries.certifications());

  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 pt-16 pb-10">
        <h1 className="text-3xl">{profile?.about_headline || "About me"}</h1>
        <div className="mt-6 space-y-4 whitespace-pre-line leading-relaxed text-muted-foreground">
          {profile?.about_description}
        </div>

        {profile?.professional_summary ? (
          <section className="mt-12 border-t border-border pt-7">
            <h2 className="label-mono">Summary</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {profile.professional_summary}
            </p>
          </section>
        ) : null}

        {education.length > 0 && (
          <section className="mt-10 border-t border-border pt-7">
            <h2 className="label-mono">Education</h2>
            <ul className="mt-4 space-y-6">
              {education.map((e) => (
                <li key={e.id}>
                  <h3 className="font-medium">{e.degree}</h3>
                  <p className="text-sm text-muted-foreground">
                    {[e.institution, e.specialization].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {[[e.start_date, e.end_date].filter(Boolean).join(" — "), e.grade]
                      .filter(Boolean)
                      .join("  ·  ")}
                  </p>
                  {e.description ? (
                    <p className="mt-1.5 text-sm text-muted-foreground">{e.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        )}

        {certifications.length > 0 && (
          <section className="mt-10 border-t border-border pt-7">
            <h2 className="label-mono">Certifications</h2>
            <ul className="mt-4 space-y-4">
              {certifications.map((c) => (
                <li key={c.id} className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-sm text-muted-foreground">{c.issuer}</span>
                  <span className="font-mono text-xs text-muted-foreground">{c.issue_date}</span>
                  {c.verification_url ? (
                    <a
                      href={c.verification_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary underline underline-offset-4"
                    >
                      Verify
                    </a>
                  ) : null}
                  {c.file_url ? (
                    <a
                      href={c.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary underline underline-offset-4"
                    >
                      Certificate
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </SiteLayout>
  );
}

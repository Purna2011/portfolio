import { Link } from "@tanstack/react-router";

export type ProjectArticleData = {
  name: string;
  category: string;
  short_description: string;
  full_description: string;
  problem_statement: string;
  objective: string;
  dataset: string;
  methodology: string;
  key_findings: string;
  business_impact: string;
  github_url: string;
  demo_url: string;
  video_url: string;
  cover_image: string;
  technologies: string[];
  images: string[];
};

function Block({ title, body }: { title: string; body: string }) {
  if (!body) return null;
  return (
    <section className="border-t border-border py-7">
      <h2 className="label-mono">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </section>
  );
}

const linkClass =
  "rounded-md border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary";

export function ProjectArticle({
  project,
  showBackLink = true,
  headingLevel = "h1",
}: {
  project: ProjectArticleData;
  showBackLink?: boolean;
  headingLevel?: "h1" | "h2";
}) {
  const Heading = headingLevel;
  return (
    <article className="mx-auto max-w-3xl px-5 pt-14 pb-10">
      {showBackLink ? (
        <Link
          to="/projects"
          className="font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          ← Projects
        </Link>
      ) : null}

      <header className={showBackLink ? "mt-6" : ""}>
        <p className="label-mono">{project.category}</p>
        <Heading className="mt-2 text-3xl">{project.name}</Heading>
        <p className="mt-3 text-muted-foreground">{project.short_description}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          {project.github_url ? (
            <a href={project.github_url} target="_blank" rel="noreferrer" className={linkClass}>
              GitHub
            </a>
          ) : null}
          {project.demo_url ? (
            <a href={project.demo_url} target="_blank" rel="noreferrer" className={linkClass}>
              Live demo
            </a>
          ) : null}
          {project.video_url ? (
            <a href={project.video_url} target="_blank" rel="noreferrer" className={linkClass}>
              Walkthrough
            </a>
          ) : null}
        </div>

        {project.technologies.length > 0 && (
          <p className="mt-5 font-mono text-xs text-muted-foreground">
            {project.technologies.join(" · ")}
          </p>
        )}
      </header>

      {project.cover_image ? (
        <img
          src={project.cover_image}
          alt={project.name}
          className="mt-8 w-full rounded-md border border-border object-cover"
        />
      ) : null}

      <div className="mt-8">
        <Block title="Overview" body={project.full_description} />
        <Block title="Problem" body={project.problem_statement} />
        <Block title="Objective" body={project.objective} />
        <Block title="Data" body={project.dataset} />
        <Block title="Approach" body={project.methodology} />
        <Block title="What I found" body={project.key_findings} />
        <Block title="Impact" body={project.business_impact} />
      </div>

      {project.images.length > 0 && (
        <section className="border-t border-border py-7">
          <h2 className="label-mono">Screens</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {project.images.map((src) => (
              <img
                key={src}
                src={src}
                alt={`${project.name} screenshot`}
                loading="lazy"
                className="w-full rounded-md border border-border"
              />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

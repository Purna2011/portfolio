import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/site-chrome";
import { ProjectArticle } from "@/components/site/project-article";

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Project` },
      { name: "description", content: "Project write-up: context, approach, findings and impact." },
      { property: "og:title", content: `${params.slug.replace(/-/g, " ")} — Project` },
      {
        property: "og:description",
        content: "Project write-up: context, approach, findings and impact.",
      },
    ],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useParams();
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <SiteLayout>
        <p className="mx-auto max-w-3xl px-5 py-20 text-sm text-muted-foreground">Loading…</p>
      </SiteLayout>
    );
  }

  if (!project) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-5 py-20">
          <h1 className="text-2xl">This project isn't available.</h1>
          <Link to="/projects" className="mt-4 inline-block text-sm text-primary underline">
            Back to all projects
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <ProjectArticle project={project} />
    </SiteLayout>
  );
}


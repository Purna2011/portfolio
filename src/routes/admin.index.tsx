import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/admin/admin-kit";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

function useCount(table: "projects" | "skills" | "experience" | "certifications" | "education") {
  return useQuery({
    queryKey: ["admin", "count", table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select(table === "projects" ? "id, published" : "id");
      if (error) throw error;
      return data ?? [];
    },
  });
}


function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-border bg-surface/50 p-4">
      <p className="label-mono">{label}</p>
      <p className="mt-2 font-mono text-2xl">{value}</p>
    </div>
  );
}

function Overview() {
  const projects = useCount("projects");
  const skills = useCount("skills");
  const experience = useCount("experience");
  const certifications = useCount("certifications");

  const rows = (projects.data ?? []) as { published?: boolean }[];
  const published = rows.filter((p) => p.published).length;
  const drafts = rows.length - published;

  const messages = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <PageHeader
        title="Overview"
        description="A quick read on what's live and what's still in progress."
      />

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Published" value={published} />
        <Stat label="Drafts" value={drafts} />
        <Stat label="Skills" value={skills.data?.length ?? 0} />
        <Stat label="Experience" value={experience.data?.length ?? 0} />
        <Stat label="Certifications" value={certifications.data?.length ?? 0} />
      </div>

      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="label-mono">Recent messages</h2>
          <Link to="/admin/projects" className="text-sm text-muted-foreground hover:text-foreground">
            Manage projects →
          </Link>
        </div>
        {(messages.data?.length ?? 0) === 0 ? (
          <p className="mt-4 rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
            No messages yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-md border border-border">
            {(messages.data ?? []).map((m) => (
              <li key={m.id} className="px-4 py-3">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-medium">{m.name}</span>
                  <a
                    href={`mailto:${m.email}`}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    {m.email}
                  </a>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

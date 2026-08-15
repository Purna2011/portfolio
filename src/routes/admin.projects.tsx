import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Eye, GripVertical, History as HistoryIcon, Loader2, Plus, RotateCcw, Search, ShieldCheck, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Btn,
  DeleteDialog,
  FieldGrid,
  PageHeader,
  StatusBadge,
  confirmDiscard,
  inputClass,
  useUnsavedGuard,
  type FieldSpec,
  type Row,
} from "@/components/admin/admin-kit";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProjectArticle, type ProjectArticleData } from "@/components/site/project-article";
import { publicQueries, slugify, type Project } from "@/lib/portfolio";

function toArticleData(row: Row): ProjectArticleData {
  const str = (k: string) => String(row[k] ?? "");
  const arr = (k: string) => (Array.isArray(row[k]) ? (row[k] as string[]) : []);
  return {
    name: str("name") || "Untitled project",
    category: str("category"),
    short_description: str("short_description"),
    full_description: str("full_description"),
    problem_statement: str("problem_statement"),
    objective: str("objective"),
    dataset: str("dataset"),
    methodology: str("methodology"),
    key_findings: str("key_findings"),
    business_impact: str("business_impact"),
    github_url: str("github_url"),
    demo_url: str("demo_url"),
    video_url: str("video_url"),
    cover_image: str("cover_image"),
    technologies: arr("technologies"),
    images: arr("images"),
  };
}

type ProjectVersion = {
  id: string;
  project_id: string;
  version_number: number;
  label: string;
  snapshot: Row;
  created_at: string;
};

async function snapshotVersion(projectId: string, payload: Row) {
  const { data } = await supabase
    .from("project_versions")
    .select("version_number")
    .eq("project_id", projectId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const next = ((data as { version_number: number } | null)?.version_number ?? 0) + 1;
  await supabase.from("project_versions").insert({
    project_id: projectId,
    version_number: next,
    label: payload["published"] ? "Published" : "Draft saved",
    snapshot: payload as never,
  } as never);
}

function isValidUrl(value: string, hosts?: string[]) {
  try {
    const u = new URL(value);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    if (hosts && !hosts.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`))) return false;
    return true;
  } catch {
    return false;
  }
}

/** Checks required content before a project can go live. Returns a list of problems. */
function publishIssues(row: Row): string[] {
  const str = (k: string) => String(row[k] ?? "").trim();
  const arr = (k: string) => (Array.isArray(row[k]) ? (row[k] as string[]) : []);
  const issues: string[] = [];

  if (!str("name")) issues.push("Project name is required.");
  if (!str("short_description")) issues.push("Short description is required.");
  if (!str("category")) issues.push("Category is required.");
  if (arr("technologies").length === 0) issues.push("Add at least one technology.");

  const cover = str("cover_image");
  const shots = arr("images").filter(Boolean);
  if (!cover && shots.length === 0)
    issues.push("Add a cover image or at least one screenshot.");
  if (cover && !isValidUrl(cover)) issues.push("Cover image URL is not a valid link.");
  if (shots.some((s) => !isValidUrl(s))) issues.push("One or more screenshot links are invalid.");

  const github = str("github_url");
  if (!github) issues.push("GitHub link is required.");
  else if (!isValidUrl(github, ["github.com"]))
    issues.push("GitHub link must be a valid github.com URL.");

  const demo = str("demo_url");
  if (demo && !isValidUrl(demo)) issues.push("Live demo URL is not a valid link.");
  const video = str("video_url");
  if (video && !isValidUrl(video)) issues.push("Video URL is not a valid link.");

  return issues;
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}



export const Route = createFileRoute("/admin/projects")({
  component: ProjectManager,
});

const emptyProject: Row = {
  name: "",
  slug: "",
  short_description: "",
  full_description: "",
  category: "",
  technologies: [],
  problem_statement: "",
  objective: "",
  dataset: "",
  methodology: "",
  key_findings: "",
  business_impact: "",
  github_url: "",
  demo_url: "",
  video_url: "",
  cover_image: "",
  images: [],
  featured: false,
  published: true,
  sort_order: 0,

};

function ProjectManager() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);
  const [draft, setDraft] = useState<Row>({});
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [dragId, setDragId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Row | null>(null);
  const [livePreview, setLivePreview] = useState(false);
  const [historyFor, setHistoryFor] = useState<Project | null>(null);
  const [blocked, setBlocked] = useState<{ name: string; issues: string[] } | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);

  const draftIssues = publishIssues(draft);



  const dirty = editing !== null && JSON.stringify(draft) !== JSON.stringify(editing);
  useUnsavedGuard(dirty);

  const { data: categories = [] } = useQuery(publicQueries.categories());
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["admin", "projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

  const fields: FieldSpec[] = [
    { key: "name", label: "Project name", type: "text" },
    {
      key: "category",
      label: "Category",
      type: "select",
      options: categories.map((c) => c.name),
    },
    {
      key: "short_description",
      label: "Short description",
      type: "textarea",
      rows: 2,
      full: true,
      hint: "One line shown on the projects list.",
    },
    { key: "full_description", label: "Overview", type: "textarea", rows: 5, full: true },
    { key: "technologies", label: "Technologies", type: "list", full: true },
    { key: "problem_statement", label: "Problem statement", type: "textarea", rows: 3, full: true },
    { key: "objective", label: "Objective", type: "textarea", rows: 3, full: true },
    { key: "dataset", label: "Dataset", type: "textarea", rows: 3, full: true },
    { key: "methodology", label: "Methodology", type: "textarea", rows: 4, full: true },
    { key: "key_findings", label: "Key findings", type: "textarea", rows: 4, full: true },
    { key: "business_impact", label: "Business impact", type: "textarea", rows: 3, full: true },
    { key: "github_url", label: "GitHub URL", type: "text" },
    { key: "demo_url", label: "Live demo URL", type: "text" },
    { key: "video_url", label: "Video URL (optional)", type: "text" },
    { key: "sort_order", label: "Display order", type: "number" },
    { key: "cover_image", label: "Cover image", type: "image", full: true },
    { key: "images", label: "Screenshots", type: "images", full: true },
    { key: "featured", label: "Featured project", type: "switch" },
    { key: "published", label: "Published", type: "switch" },
  ];

  const save = useMutation({
    mutationFn: async ({ row, publish }: { row: Row; publish?: boolean }) => {
      const payload: Row = { ...row };
      const id = payload["id"] as string | undefined;
      delete payload["id"];
      delete payload["created_at"];
      delete payload["updated_at"];
      if (publish !== undefined) payload["published"] = publish;
      if (!String(payload["name"] ?? "").trim()) throw new Error("Project name is required");
      payload["slug"] =
        String(payload["slug"] ?? "").trim() || `${slugify(String(payload["name"]))}`;
      let savedId = id;
      if (id) {
        const { error } = await supabase
          .from("projects")
          .update(payload as never)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("projects")
          .insert(payload as never)
          .select("id")
          .single();
        if (error) throw error;
        savedId = (data as { id: string } | null)?.id;
      }
      if (savedId) await snapshotVersion(savedId, payload);
    },
    onSuccess: () => {
      toast.success("Changes saved successfully");
      setEditing(null);
      qc.invalidateQueries();
    },
    onError: (e) =>
      toast.error(
        e instanceof Error && e.message.includes("duplicate")
          ? "A project with that name already exists."
          : "Unable to save changes. Please try again.",
      ),
  });

  /** Runs the pre-publish checks; only calls `go` when everything passes. */
  function guardPublish(row: Row, go: () => void) {
    const issues = publishIssues(row);
    if (issues.length > 0) {
      setBlocked({ name: String(row["name"] ?? "This project") || "This project", issues });
      toast.error("Can't publish yet — some required details are missing.");
      return;
    }
    go();
  }

  const togglePublish = useMutation({
    mutationFn: async (p: Project) => {
      const { error } = await supabase
        .from("projects")
        .update({ published: !p.published })
        .eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Visibility updated");
      qc.invalidateQueries();
    },
    onError: () => toast.error("Unable to update visibility. Please try again."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Project deleted");
      setDeleteTarget(null);
      qc.invalidateQueries();
    },
    onError: () => toast.error("Unable to delete the project. Please try again."),
  });


  const { data: versions = [], isLoading: versionsLoading } = useQuery({
    queryKey: ["admin", "project_versions", historyFor?.id],
    enabled: historyFor !== null,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_versions")
        .select("*")
        .eq("project_id", historyFor!.id)
        .order("version_number", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ProjectVersion[];
    },
  });

  const restore = useMutation({
    mutationFn: async (version: ProjectVersion) => {
      const payload: Row = { ...version.snapshot };
      delete payload["id"];
      delete payload["created_at"];
      delete payload["updated_at"];
      const { error } = await supabase
        .from("projects")
        .update(payload as never)
        .eq("id", version.project_id);
      if (error) throw error;
      await snapshotVersion(version.project_id, payload);
    },
    onSuccess: () => {
      toast.success("Earlier version restored");
      setHistoryFor(null);
      qc.invalidateQueries();
    },
    onError: () => toast.error("Unable to restore that version. Please try again."),
  });


  async function reorder(fromId: string, toId: string) {
    const ordered = [...projects];
    const from = ordered.findIndex((p) => p.id === fromId);
    const to = ordered.findIndex((p) => p.id === toId);
    if (from < 0 || to < 0 || from === to) return;
    const [moved] = ordered.splice(from, 1);
    if (moved) ordered.splice(to, 0, moved);
    qc.setQueryData(["admin", "projects"], ordered);
    await Promise.all(
      ordered.map((p, i) => supabase.from("projects").update({ sort_order: i }).eq("id", p.id)),
    );
    toast.success("Order updated");
    qc.invalidateQueries();
  }

  const audit = projects.map((project) => ({
    project,
    issues: publishIssues(project as unknown as Row),
  }));

  const visible = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" ? p.published : !p.published);
    return matchesSearch && matchesStatus;
  });

  function openNew() {
    const base = { ...emptyProject, sort_order: projects.length };
    setEditing(base);
    setDraft(base);
  }

  return (
    <>
      <PageHeader
        title="Projects"
        description="Drag to reorder. Drafts stay private until you publish them."
        action={
          <div className="flex flex-wrap gap-2">
            <Btn variant="outline" onClick={() => setAuditOpen(true)}>
              <ShieldCheck className="h-4 w-4" /> Validate all
            </Btn>
            <Btn onClick={openNew}>
              <Plus className="h-4 w-4" /> Add new project
            </Btn>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            className={`${inputClass} pl-9`}
            placeholder="Search projects"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {(["all", "published", "draft"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-md border px-3 py-1.5 font-mono text-xs capitalize ${
              statusFilter === s
                ? "border-primary text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : visible.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No projects match. Add your first one with “Add new project”.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {visible.map((p) => (
            <li
              key={p.id}
              draggable
              onDragStart={() => setDragId(p.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) void reorder(dragId, p.id);
                setDragId(null);
              }}
              className="flex items-center gap-3 bg-surface/40 px-4 py-3"
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium">{p.name}</span>
                  <StatusBadge tone={p.published ? "on" : "off"}>
                    {p.published ? "Published" : "Draft"}
                  </StatusBadge>
                  {p.featured ? <StatusBadge tone="on">Featured</StatusBadge> : null}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {[p.category, p.short_description].filter(Boolean).join(" — ")}
                </p>
              </div>
              <Btn variant="ghost" onClick={() => setPreview(p as unknown as Row)} title="Preview">
                <Eye className="h-4 w-4" />
              </Btn>
              <Btn variant="ghost" onClick={() => setHistoryFor(p)} title="Version history">
                <HistoryIcon className="h-4 w-4" />
              </Btn>
              <Btn
                variant="outline"
                disabled={togglePublish.isPending}
                onClick={() =>
                  p.published
                    ? togglePublish.mutate(p)
                    : guardPublish(p as unknown as Row, () => togglePublish.mutate(p))
                }
              >
                {p.published ? "Unpublish" : "Publish"}
              </Btn>


              <Btn

                variant="outline"
                onClick={() => {
                  setEditing(p as unknown as Row);
                  setDraft({ ...(p as unknown as Row) });
                }}
              >
                Edit
              </Btn>
              <Btn variant="ghost" onClick={() => setDeleteTarget(p)}>
                <Trash2 className="h-4 w-4" />
              </Btn>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open && !confirmDiscard(dirty)) return;
          if (!open) setEditing(null);
        }}
      >
        <DialogContent
          className={`max-h-[88vh] overflow-y-auto ${livePreview ? "max-w-6xl" : "max-w-3xl"}`}
        >
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center justify-between gap-3 pr-8">
              <span>{editing?.["id"] ? "Edit project" : "New project"}</span>
              <button
                type="button"
                onClick={() => setLivePreview((v) => !v)}
                className={`rounded-md border px-3 py-1.5 font-mono text-xs ${
                  livePreview ? "border-primary text-primary" : "border-border text-muted-foreground"
                }`}
              >
                {livePreview ? "Hide live preview" : "Live preview"}
              </button>
            </DialogTitle>
          </DialogHeader>

          <div className={livePreview ? "grid gap-6 lg:grid-cols-2" : ""}>
            <div className={livePreview ? "lg:max-h-[62vh] lg:overflow-y-auto lg:pr-2" : ""}>
              <FieldGrid
                fields={fields}
                values={draft}
                set={(k, v) => setDraft((d) => ({ ...d, [k]: v }))}
              />
            </div>
            {livePreview ? (
              <div className="rounded-md border border-border bg-background lg:sticky lg:top-0 lg:max-h-[62vh] lg:overflow-y-auto">
                <div className="flex items-center gap-2 border-b border-border px-4 py-2">
                  <span className="label-mono text-xs">Live public preview</span>
                  <StatusBadge tone={draft["published"] ? "on" : "off"}>
                    {draft["published"] ? "Published" : "Draft — not live yet"}
                  </StatusBadge>
                </div>
                <ProjectArticle
                  project={toArticleData(draft)}
                  showBackLink={false}
                  headingLevel="h2"
                />
              </div>
            ) : null}
          </div>

          {draftIssues.length > 0 ? (
            <div className="mt-6 rounded-md border border-destructive/40 bg-destructive/5 p-4">
              <p className="text-sm font-medium text-destructive">
                Needed before this project can go live
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                {draftIssues.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap justify-end gap-2 border-t border-border pt-5">
            <Btn
              variant="ghost"
              onClick={() => {
                if (confirmDiscard(dirty)) setEditing(null);
              }}
            >
              Cancel
            </Btn>
            <Btn variant="outline" onClick={() => setPreview(draft)}>
              <Eye className="h-4 w-4" /> Full preview
            </Btn>


            <Btn variant="outline" onClick={() => save.mutate({ row: draft, publish: false })}>
              Save as draft
            </Btn>
            <Btn
              variant="outline"
              onClick={() => {
                if (draft["published"]) guardPublish(draft, () => save.mutate({ row: draft }));
                else save.mutate({ row: draft });
              }}
            >
              Save project
            </Btn>
            <Btn
              onClick={() => guardPublish(draft, () => save.mutate({ row: draft, publish: true }))}
              disabled={save.isPending}
            >
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Publish
            </Btn>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={preview !== null} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto p-0">
          <DialogHeader className="sticky top-0 z-10 border-b border-border bg-background px-6 py-4">
            <DialogTitle className="flex flex-wrap items-center gap-3">
              Public preview
              <StatusBadge tone={preview?.["published"] ? "on" : "off"}>
                {preview?.["published"] ? "Published" : "Draft — not live yet"}
              </StatusBadge>
            </DialogTitle>
          </DialogHeader>
          <div className="bg-background">
            {preview ? (
              <ProjectArticle
                project={toArticleData(preview)}
                showBackLink={false}
                headingLevel="h2"
              />
            ) : null}
          </div>
          <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-border bg-background px-6 py-4">
            <Btn variant="ghost" onClick={() => setPreview(null)}>
              Back to editing
            </Btn>
            <Btn
              onClick={() => {
                const row = preview;
                if (!row) return;
                guardPublish(row, () => {
                  setPreview(null);
                  save.mutate({ row, publish: true });
                });
              }}
              disabled={save.isPending}
            >
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Looks good — publish
            </Btn>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={historyFor !== null} onOpenChange={(v) => !v && setHistoryFor(null)}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Version history — {historyFor?.name}</DialogTitle>
          </DialogHeader>
          {versionsLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : versions.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No saved versions yet. Each time you save or publish this project, a snapshot is
              recorded here.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border">
              {versions.map((v, i) => (
                <li key={v.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        v{v.version_number}
                      </span>
                      <span className="truncate text-sm font-medium">
                        {String(v.snapshot["name"] ?? historyFor?.name ?? "")}
                      </span>
                      <StatusBadge tone={v.snapshot["published"] ? "on" : "off"}>
                        {v.label || (v.snapshot["published"] ? "Published" : "Draft")}
                      </StatusBadge>
                      {i === 0 ? <StatusBadge tone="on">Current</StatusBadge> : null}
                    </div>
                    <p className="text-xs text-muted-foreground">{formatWhen(v.created_at)}</p>
                  </div>
                  <Btn
                    variant="ghost"
                    title="Preview this version"
                    onClick={() => setPreview(v.snapshot)}
                  >
                    <Eye className="h-4 w-4" />
                  </Btn>
                  <Btn
                    variant="outline"
                    disabled={i === 0 || restore.isPending}
                    onClick={() => restore.mutate(v)}
                  >
                    <RotateCcw className="h-4 w-4" /> Restore
                  </Btn>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>



      <Dialog open={auditOpen} onOpenChange={setAuditOpen}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Publish readiness — all projects</DialogTitle>
          </DialogHeader>
          {projects.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No projects yet.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {audit.filter((a) => a.issues.length === 0).length} of {audit.length} projects are
                ready to publish.
              </p>
              <ul className="mt-4 divide-y divide-border rounded-md border border-border">
                {audit.map(({ project, issues }) => (
                  <li key={project.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {issues.length === 0 ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 text-destructive" />
                      )}
                      <span className="truncate text-sm font-medium">{project.name}</span>
                      <StatusBadge tone={issues.length === 0 ? "on" : "off"}>
                        {issues.length === 0 ? "Ready to publish" : `${issues.length} to fix`}
                      </StatusBadge>
                      <StatusBadge tone={project.published ? "on" : "off"}>
                        {project.published ? "Published" : "Draft"}
                      </StatusBadge>
                      <Btn
                        variant="ghost"
                        onClick={() => {
                          setAuditOpen(false);
                          setEditing(project as unknown as Row);
                          setDraft({ ...(project as unknown as Row) });
                        }}
                      >
                        Fix
                      </Btn>
                    </div>
                    {issues.length > 0 ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                        {issues.map((i) => (
                          <li key={i}>{i}</li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={blocked !== null} onOpenChange={(v) => !v && setBlocked(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Not ready to publish</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            “{blocked?.name}” is missing a few things visitors expect to see:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {(blocked?.issues ?? []).map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <div className="mt-6 flex justify-end">
            <Btn onClick={() => setBlocked(null)}>Back to editing</Btn>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={deleteTarget !== null}

        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete this project?"
        description="This action will remove the project from your portfolio."
        confirmLabel="Delete project"
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
      />
    </>
  );
}

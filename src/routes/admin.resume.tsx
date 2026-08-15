import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Btn, DeleteDialog, PageHeader, StatusBadge, inputClass } from "@/components/admin/admin-kit";
import { uploadFile, type Resume } from "@/lib/portfolio";

export const Route = createFileRoute("/admin/resume")({
  component: ResumeManager,
});

function ResumeManager() {
  const qc = useQueryClient();
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ["admin", "resumes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Resume[];
    },
  });

  async function upload(file: File) {
    setBusy(true);
    try {
      const url = await uploadFile(file, "resume");
      const { error } = await supabase
        .from("resumes")
        .insert({ label: label || file.name, file_url: url, is_active: resumes.length === 0 });
      if (error) throw error;
      toast.success("Resume uploaded");
      setLabel("");
      qc.invalidateQueries();
    } catch {
      toast.error("Unable to upload the resume. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const activate = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("resumes").update({ is_active: false }).neq("id", id);
      const { error } = await supabase.from("resumes").update({ is_active: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Changes saved successfully");
      qc.invalidateQueries();
    },
    onError: () => toast.error("Unable to save changes. Please try again."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("resumes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Resume removed");
      setDeleteTarget(null);
      qc.invalidateQueries();
    },
    onError: () => toast.error("Unable to remove the resume. Please try again."),
  });

  return (
    <>
      <PageHeader
        title="Resume"
        description="The active resume is what the Download resume button serves."
      />

      <div className="rounded-md border border-border bg-surface/50 p-5">
        <label htmlFor="resume-label" className="text-sm font-medium">
          Upload a new resume
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            id="resume-label"
            className={`${inputClass} max-w-56`}
            placeholder="Label (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <input
            type="file"
            accept="application/pdf"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
            className="text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:text-foreground"
          />
          {busy ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : resumes.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No resume uploaded yet.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {resumes.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{r.label}</span>
                    {r.is_active ? <StatusBadge tone="on">Active</StatusBadge> : null}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={r.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline underline-offset-4"
                >
                  Preview
                </a>
                {!r.is_active && (
                  <Btn variant="outline" onClick={() => activate.mutate(r.id)}>
                    <Check className="h-4 w-4" /> Set active
                  </Btn>
                )}
                <Btn variant="ghost" onClick={() => setDeleteTarget(r)}>
                  <Trash2 className="h-4 w-4" />
                </Btn>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Remove this resume?"
        description="Visitors will no longer be able to download it."
        confirmLabel="Remove resume"
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
      />
    </>
  );
}

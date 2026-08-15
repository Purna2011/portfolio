import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GripVertical, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/portfolio";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type Row = Record<string, unknown>;

export type FieldSpec = {
  key: string;
  label: string;
  type: "text" | "textarea" | "switch" | "number" | "list" | "image" | "images" | "file" | "select";
  placeholder?: string;
  options?: string[];
  hint?: string;
  rows?: number;
  full?: boolean;
};

export const inputClass =
  "w-full rounded-md border border-input bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Btn({
  variant = "default",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "danger";
}) {
  const styles = {
    default: "bg-primary text-primary-foreground hover:opacity-90",
    outline: "border border-border text-foreground hover:bg-accent",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-accent",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-60 ${styles} ${className}`}
    />
  );
}

export function StatusBadge({ tone, children }: { tone: "on" | "off"; children: React.ReactNode }) {
  return (
    <span
      className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
        tone === "on"
          ? "border-success/40 text-success"
          : "border-border text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

/* ---------------- file upload ---------------- */

function FileButton({
  folder,
  accept,
  label,
  onDone,
}: {
  folder: string;
  accept: string;
  label: string;
  onDone: (urls: string[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          if (!files.length) return;
          setBusy(true);
          try {
            const urls: string[] = [];
            for (const f of files) urls.push(await uploadFile(f, folder));
            onDone(urls);
            toast.success(urls.length > 1 ? `${urls.length} files uploaded` : "Upload complete");
          } catch {
            toast.error("Upload failed. Please try again.");
          } finally {
            setBusy(false);
            if (ref.current) ref.current.value = "";
          }
        }}
        multiple={folder === "gallery"}
      />

      <Btn type="button" variant="outline" onClick={() => ref.current?.click()} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {label}
      </Btn>
    </>
  );
}

/* ---------------- generic field ---------------- */

function Field({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const id = `f-${spec.key}`;

  const control = () => {
    switch (spec.type) {
      case "textarea":
        return (
          <textarea
            id={id}
            rows={spec.rows ?? 4}
            className={inputClass}
            placeholder={spec.placeholder ?? ""}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case "number":
        return (
          <input
            id={id}
            type="number"
            className={inputClass}
            value={Number(value ?? 0)}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        );
      case "switch":
        return (
          <button
            id={id}
            type="button"
            role="switch"
            aria-checked={Boolean(value)}
            onClick={() => onChange(!value)}
            className={`relative h-6 w-11 rounded-full border transition-colors ${
              value ? "border-primary bg-primary" : "border-border bg-surface-2"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-background transition-transform ${
                value ? "translate-x-5.5" : "translate-x-0.5"
              }`}
              style={{ height: 18, width: 18 }}
            />
          </button>
        );
      case "select":
        return (
          <select
            id={id}
            className={inputClass}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">—</option>
            {(spec.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        );
      case "list": {
        const items = Array.isArray(value) ? (value as string[]) : [];
        return (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={inputClass}
                  value={item}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = e.target.value;
                    onChange(next);
                  }}
                />
                <Btn
                  type="button"
                  variant="ghost"
                  onClick={() => onChange(items.filter((_, j) => j !== i))}
                >
                  <X className="h-4 w-4" />
                </Btn>
              </div>
            ))}
            <Btn type="button" variant="outline" onClick={() => onChange([...items, ""])}>
              <Plus className="h-4 w-4" /> Add item
            </Btn>
          </div>
        );
      }
      case "image":
        return (
          <div className="space-y-2">
            {value ? (
              <img
                src={String(value)}
                alt=""
                className="h-28 w-full max-w-xs rounded-md border border-border object-cover"
              />
            ) : null}
            <div className="flex gap-2">
              <FileButton
                folder="images"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                label={value ? "Replace" : "Upload image"}
                onDone={(urls) => onChange(urls[0] ?? "")}
              />

              {value ? (
                <Btn type="button" variant="ghost" onClick={() => onChange("")}>
                  Remove
                </Btn>
              ) : null}
            </div>
          </div>
        );
      case "images": {
        const imgs = Array.isArray(value) ? (value as string[]) : [];
        const move = (from: number, to: number) => {
          if (to < 0 || to >= imgs.length) return;
          const next = [...imgs];
          const [item] = next.splice(from, 1);
          next.splice(to, 0, item as string);
          onChange(next);
        };
        return (
          <div className="space-y-3">
            {imgs.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {imgs.map((src, i) => (
                  <div key={src} className="group relative">
                    <img
                      src={src}
                      alt=""
                      className="h-24 w-full rounded-md border border-border object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex justify-between bg-background/85 px-1 py-0.5 text-xs">
                      <button type="button" onClick={() => move(i, i - 1)} aria-label="Move left">
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => onChange(imgs.filter((_, j) => j !== i))}
                        aria-label="Remove image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => move(i, i + 1)} aria-label="Move right">
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <FileButton
              folder="gallery"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              label="Upload screenshots"
              onDone={(urls) => onChange([...imgs, ...urls])}
            />

          </div>
        );
      }
      case "file":
        return (
          <div className="flex flex-wrap items-center gap-2">
            {value ? (
              <a
                href={String(value)}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary underline underline-offset-4"
              >
                Preview current file
              </a>
            ) : null}
            <FileButton
              folder="files"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              label={value ? "Replace file" : "Upload file"}
              onDone={(urls) => onChange(urls[0] ?? "")}
            />

            {value ? (
              <Btn type="button" variant="ghost" onClick={() => onChange("")}>
                Remove
              </Btn>
            ) : null}
          </div>
        );
      default:
        return (
          <input
            id={id}
            className={inputClass}
            placeholder={spec.placeholder ?? ""}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <div className={spec.full ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="text-sm font-medium">
        {spec.label}
      </label>
      {spec.hint ? <p className="mb-1.5 text-xs text-muted-foreground">{spec.hint}</p> : null}
      <div className="mt-1.5">{control()}</div>
    </div>
  );
}

export function FieldGrid({
  fields,
  values,
  set,
}: {
  fields: FieldSpec[];
  values: Row;
  set: (key: string, v: unknown) => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map((f) => (
        <Field key={f.key} spec={f} value={values[f.key]} onChange={(v) => set(f.key, v)} />
      ))}
    </div>
  );
}

/* ---------------- unsaved-changes guard ---------------- */

export function useUnsavedGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}

export function confirmDiscard(dirty: boolean) {
  if (!dirty) return true;
  return window.confirm("You have unsaved changes. Leave without saving?");
}

/* ---------------- delete confirmation ---------------- */

export function DeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:opacity-90"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ---------------- generic collection manager ---------------- */

type TableName =
  | "skills"
  | "experience"
  | "education"
  | "certifications"
  | "social_links"
  | "categories";

export function CollectionManager({
  table,
  title,
  description,
  fields,
  defaults,
  primary,
  secondary,
  badges,
  addLabel,
}: {
  table: TableName;
  title: string;
  description: string;
  fields: FieldSpec[];
  defaults: Row;
  primary: (row: Row) => string;
  secondary?: (row: Row) => string;
  badges?: (row: Row) => React.ReactNode;
  addLabel: string;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);
  const [draft, setDraft] = useState<Row>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const dirty = editing !== null && JSON.stringify(draft) !== JSON.stringify(editing);
  useUnsavedGuard(dirty);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const invalidate = () => qc.invalidateQueries();

  const save = useMutation({
    mutationFn: async (row: Row) => {
      const payload = { ...row };
      const id = payload["id"] as string | undefined;
      delete payload["id"];
      delete payload["created_at"];
      const client = supabase.from(table) as unknown as {
        update: (v: Row) => { eq: (c: string, v: string) => Promise<{ error: unknown }> };
        insert: (v: Row) => Promise<{ error: unknown }>;
      };
      if (id) {
        const { error } = await client.update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await client.insert(payload);
        if (error) throw error;
      }

    },
    onSuccess: () => {
      toast.success("Changes saved successfully");
      setEditing(null);
      invalidate();
    },
    onError: () => toast.error("Unable to save changes. Please try again."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Entry deleted");
      setDeleteId(null);
      invalidate();
    },
    onError: () => toast.error("Unable to delete. Please try again."),
  });

  async function reorder(fromId: string, toId: string) {
    const ordered = [...rows];
    const from = ordered.findIndex((r) => r["id"] === fromId);
    const to = ordered.findIndex((r) => r["id"] === toId);
    if (from < 0 || to < 0 || from === to) return;
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved as Row);
    qc.setQueryData(["admin", table], ordered);
    await Promise.all(
      ordered.map((r, i) =>
        supabase
          .from(table)
          .update({ sort_order: i })
          .eq("id", r["id"] as string),
      ),
    );
    toast.success("Order updated");
    invalidate();
  }

  function openNew() {
    const base = { ...defaults, sort_order: rows.length };
    setEditing(base);
    setDraft(base);
  }

  function openEdit(row: Row) {
    setEditing(row);
    setDraft({ ...row });
  }

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          <Btn onClick={openNew}>
            <Plus className="h-4 w-4" /> {addLabel}
          </Btn>
        }
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Nothing here yet. Use “{addLabel}” to add your first entry.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {rows.map((row) => (
            <li
              key={String(row["id"])}
              draggable
              onDragStart={() => setDragId(String(row["id"]))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) void reorder(dragId, String(row["id"]));
                setDragId(null);
              }}
              className="flex items-center gap-3 bg-surface/40 px-4 py-3"
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium">{primary(row)}</span>
                  {badges?.(row)}
                </div>
                {secondary ? (
                  <p className="truncate text-xs text-muted-foreground">{secondary(row)}</p>
                ) : null}
              </div>
              <Btn variant="outline" onClick={() => openEdit(row)}>
                Edit
              </Btn>
              <Btn variant="ghost" onClick={() => setDeleteId(String(row["id"]))}>
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
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.["id"] ? `Edit ${title}` : addLabel}</DialogTitle>
          </DialogHeader>
          <FieldGrid
            fields={fields}
            values={draft}
            set={(k, v) => setDraft((d) => ({ ...d, [k]: v }))}
          />
          <div className="mt-6 flex justify-end gap-2">
            <Btn
              variant="outline"
              onClick={() => {
                if (confirmDiscard(dirty)) setEditing(null);
              }}
            >
              Cancel
            </Btn>
            <Btn onClick={() => save.mutate(draft)} disabled={save.isPending}>
              {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save changes
            </Btn>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete this entry?"
        description="This will remove it from your portfolio."
        confirmLabel="Delete"
        onConfirm={() => deleteId && remove.mutate(deleteId)}
      />
    </>
  );
}

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Btn, FieldGrid, PageHeader, useUnsavedGuard, type FieldSpec, type Row } from "./admin-kit";

export function ProfileForm({
  title,
  description,
  fields,
}: {
  title: string;
  description: string;
  fields: FieldSpec[];
}) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Row | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["admin", "profile"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profile").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile && draft === null) setDraft({ ...profile });
  }, [profile, draft]);

  const dirty = Boolean(profile && draft && JSON.stringify(draft) !== JSON.stringify(profile));
  useUnsavedGuard(dirty);

  const save = useMutation({
    mutationFn: async () => {
      if (!draft) return;
      const patch: Row = {};
      for (const f of fields) patch[f.key] = draft[f.key];
      if (profile?.id) {
        const { error } = await supabase.from("profile").update(patch as never).eq("id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("profile").insert(patch as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Changes saved successfully");
      qc.invalidateQueries();
    },
    onError: () => toast.error("Unable to save changes. Please try again."),
  });

  if (isLoading || !draft) {
    return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
  }

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          <Btn onClick={() => save.mutate()} disabled={!dirty || save.isPending}>
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save changes
          </Btn>
        }
      />
      <FieldGrid
        fields={fields}
        values={draft}
        set={(k, v) => setDraft((d) => ({ ...(d ?? {}), [k]: v }))}
      />
      <div className="mt-8 flex items-center gap-3 border-t border-border pt-6">
        <Btn onClick={() => save.mutate()} disabled={!dirty || save.isPending}>
          Save changes
        </Btn>
        {dirty ? (
          <span className="text-xs text-muted-foreground">You have unsaved changes.</span>
        ) : null}
      </div>
    </>
  );
}

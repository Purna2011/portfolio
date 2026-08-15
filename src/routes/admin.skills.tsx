import { createFileRoute } from "@tanstack/react-router";
import { CollectionManager, StatusBadge } from "@/components/admin/admin-kit";

export const Route = createFileRoute("/admin/skills")({
  component: () => (
    <CollectionManager
      table="skills"
      title="Skills"
      description="Grouped by category on the homepage. Drag to reorder."
      addLabel="Add skill"
      defaults={{ name: "", category: "", note: "", featured: false, sort_order: 0 }}
      fields={[
        { key: "name", label: "Skill", type: "text" },
        { key: "category", label: "Category", type: "text", hint: "e.g. Data & Querying" },
        { key: "note", label: "Note", type: "text", full: true },
        { key: "featured", label: "Featured", type: "switch" },
      ]}
      primary={(r) => String(r["name"] ?? "")}
      secondary={(r) => String(r["category"] ?? "")}
      badges={(r) => (r["featured"] ? <StatusBadge tone="on">Featured</StatusBadge> : null)}
    />
  ),
});

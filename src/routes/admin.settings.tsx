import { createFileRoute } from "@tanstack/react-router";
import { CollectionManager } from "@/components/admin/admin-kit";

export const Route = createFileRoute("/admin/settings")({
  component: () => (
    <CollectionManager
      table="categories"
      title="Project categories"
      description="Categories available in the project form and as filters on the public site."
      addLabel="Add category"
      defaults={{ name: "", sort_order: 0 }}
      fields={[{ key: "name", label: "Category name", type: "text", full: true }]}
      primary={(r) => String(r["name"] ?? "")}
    />
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { CollectionManager, StatusBadge } from "@/components/admin/admin-kit";

export const Route = createFileRoute("/admin/social")({
  component: () => (
    <CollectionManager
      table="social_links"
      title="Social links"
      description="Shown in the footer and on the contact page."
      addLabel="Add link"
      defaults={{ label: "", url: "", icon: "link", visible: true, sort_order: 0 }}
      fields={[
        { key: "label", label: "Label", type: "text", hint: "e.g. GitHub" },
        { key: "url", label: "URL", type: "text" },
        { key: "visible", label: "Visible", type: "switch" },
      ]}
      primary={(r) => String(r["label"] ?? "")}
      secondary={(r) => String(r["url"] ?? "")}
      badges={(r) => (r["visible"] ? null : <StatusBadge tone="off">Hidden</StatusBadge>)}
    />
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { CollectionManager, StatusBadge } from "@/components/admin/admin-kit";

export const Route = createFileRoute("/admin/experience")({
  component: () => (
    <CollectionManager
      table="experience"
      title="Experience"
      description="Roles and internships shown on the homepage timeline."
      addLabel="Add experience"
      defaults={{
        title: "",
        organization: "",
        start_date: "",
        end_date: "",
        location: "",
        description: "",
        responsibilities: [],
        achievements: [],
        technologies: [],
        visible: true,
        sort_order: 0,
      }}
      fields={[
        { key: "title", label: "Job / internship title", type: "text" },
        { key: "organization", label: "Organization", type: "text" },
        { key: "start_date", label: "Start date", type: "text", hint: "e.g. Jan 2024" },
        { key: "end_date", label: "End date", type: "text", hint: "e.g. Present" },
        { key: "location", label: "Location", type: "text" },
        { key: "visible", label: "Visible on site", type: "switch" },
        { key: "description", label: "Description", type: "textarea", rows: 3, full: true },
        { key: "responsibilities", label: "Responsibilities", type: "list", full: true },
        { key: "achievements", label: "Achievements", type: "list", full: true },
        { key: "technologies", label: "Technologies", type: "list", full: true },
      ]}
      primary={(r) => String(r["title"] ?? "")}
      secondary={(r) =>
        [r["organization"], [r["start_date"], r["end_date"]].filter(Boolean).join(" — ")]
          .filter(Boolean)
          .join(" · ")
      }
      badges={(r) => (r["visible"] ? null : <StatusBadge tone="off">Hidden</StatusBadge>)}
    />
  ),
});

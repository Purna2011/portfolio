import { createFileRoute } from "@tanstack/react-router";
import { CollectionManager } from "@/components/admin/admin-kit";

export const Route = createFileRoute("/admin/education")({
  component: () => (
    <CollectionManager
      table="education"
      title="Education"
      description="Degrees and coursework shown on the About page."
      addLabel="Add education"
      defaults={{
        degree: "",
        institution: "",
        specialization: "",
        start_date: "",
        end_date: "",
        grade: "",
        description: "",
        sort_order: 0,
      }}
      fields={[
        { key: "degree", label: "Degree", type: "text" },
        { key: "institution", label: "Institution", type: "text" },
        { key: "specialization", label: "Specialization", type: "text" },
        { key: "grade", label: "Grade / CGPA", type: "text" },
        { key: "start_date", label: "Start date", type: "text" },
        { key: "end_date", label: "End date", type: "text" },
        { key: "description", label: "Description", type: "textarea", rows: 3, full: true },
      ]}
      primary={(r) => String(r["degree"] ?? "")}
      secondary={(r) => [r["institution"], r["specialization"]].filter(Boolean).join(" · ")}
    />
  ),
});

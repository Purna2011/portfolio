import { createFileRoute } from "@tanstack/react-router";
import { CollectionManager } from "@/components/admin/admin-kit";

export const Route = createFileRoute("/admin/certifications")({
  component: () => (
    <CollectionManager
      table="certifications"
      title="Certifications"
      description="Upload the certificate file or add a verification link."
      addLabel="Add certification"
      defaults={{
        name: "",
        issuer: "",
        issue_date: "",
        credential_id: "",
        file_url: "",
        verification_url: "",
        sort_order: 0,
      }}
      fields={[
        { key: "name", label: "Certification name", type: "text" },
        { key: "issuer", label: "Issuing organization", type: "text" },
        { key: "issue_date", label: "Date", type: "text", hint: "e.g. Mar 2025" },
        { key: "credential_id", label: "Credential ID", type: "text" },
        { key: "verification_url", label: "Verification URL", type: "text", full: true },
        { key: "file_url", label: "Certificate (PDF or image)", type: "file", full: true },
      ]}
      primary={(r) => String(r["name"] ?? "")}
      secondary={(r) => [r["issuer"], r["issue_date"]].filter(Boolean).join(" · ")}
    />
  ),
});

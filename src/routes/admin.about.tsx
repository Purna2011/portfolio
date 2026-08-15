import { createFileRoute } from "@tanstack/react-router";
import { ProfileForm } from "@/components/admin/profile-form";

export const Route = createFileRoute("/admin/about")({
  component: () => (
    <ProfileForm
      title="About me"
      description="What appears on the About page. Plain text — line breaks are kept."
      fields={[
        { key: "about_headline", label: "About headline", type: "text", full: true },
        {
          key: "about_description",
          label: "About paragraphs",
          type: "textarea",
          rows: 10,
          full: true,
        },
        {
          key: "professional_summary",
          label: "Professional summary",
          type: "textarea",
          rows: 5,
          full: true,
          hint: "Optional. A tighter version for recruiters.",
        },
      ]}
    />
  ),
});

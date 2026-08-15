import { createFileRoute } from "@tanstack/react-router";
import { ProfileForm } from "@/components/admin/profile-form";

export const Route = createFileRoute("/admin/profile")({
  component: () => (
    <ProfileForm
      title="Personal details"
      description="These fields drive the header, homepage intro and contact page."
      fields={[
        { key: "full_name", label: "Full name", type: "text" },
        { key: "title", label: "Professional title", type: "text" },
        {
          key: "headline",
          label: "Short headline",
          type: "textarea",
          rows: 2,
          full: true,
          hint: "The first line people read on the homepage.",
        },
        { key: "short_bio", label: "Short bio", type: "textarea", rows: 3, full: true },
        { key: "email", label: "Email", type: "text" },
        { key: "phone", label: "Phone", type: "text" },
        { key: "location", label: "Location", type: "text" },
        { key: "open_to_work", label: "Open to work", type: "switch" },
        { key: "linkedin_url", label: "LinkedIn URL", type: "text" },
        { key: "github_url", label: "GitHub URL", type: "text" },
        { key: "photo_url", label: "Profile photo", type: "image", full: true },
      ]}
    />
  ),
});

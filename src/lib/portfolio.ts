import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profile">;
export type Project = Tables<"projects">;
export type Skill = Tables<"skills">;
export type Experience = Tables<"experience">;
export type Education = Tables<"education">;
export type Certification = Tables<"certifications">;
export type SocialLink = Tables<"social_links">;
export type Resume = Tables<"resumes">;
export type Category = Tables<"categories">;

export const BUCKET = "portfolio";
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "project"
  );
}

/** Uploads a file and returns a long-lived signed URL that anyone can open. */
export async function uploadFile(file: File, folder: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, TEN_YEARS);
  if (signError || !data) throw signError ?? new Error("Could not create file link");
  return data.signedUrl;
}

export async function removeFile(signedUrl: string) {
  const match = /\/object\/sign\/portfolio\/(.+?)(\?|$)/.exec(signedUrl);
  if (!match?.[1]) return;
  await supabase.storage.from(BUCKET).remove([decodeURIComponent(match[1])]);
}

/* ---------- public reads ---------- */

// Columns readable by anonymous visitors (phone is intentionally excluded).
const PUBLIC_PROFILE_COLUMNS =
  "id, full_name, title, headline, about_headline, about_description, short_bio, professional_summary, email, location, linkedin_url, github_url, resume_url, photo_url, open_to_work, created_at, updated_at";

export const publicQueries = {
  profile: () => ({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile")
        .select(PUBLIC_PROFILE_COLUMNS)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  }),
  publishedProjects: () => ({
    queryKey: ["projects", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  }),
  skills: () => ({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  }),
  experience: () => ({
    queryKey: ["experience", "visible"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experience")
        .select("*")
        .eq("visible", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  }),
  education: () => ({
    queryKey: ["education"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  }),
  certifications: () => ({
    queryKey: ["certifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  }),
  socialLinks: () => ({
    queryKey: ["social_links", "visible"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .eq("visible", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  }),
  activeResume: () => ({
    queryKey: ["resume", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  }),
  categories: () => ({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  }),
};

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SiteLayout } from "@/components/site/site-chrome";
import { publicQueries } from "@/lib/portfolio";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Raavi Purna Satya Kumar" },
      {
        name: "description",
        content: "Send a message about analytics work, dashboards or a role you're hiring for.",
      },
      { property: "og:title", content: "Contact — Raavi Purna Satya Kumar" },
      { property: "og:description", content: "Send a message or find me on LinkedIn and GitHub." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please add your name").max(100),
  email: z.string().trim().email("That email doesn't look right").max(255),
  message: z.string().trim().min(10, "A little more detail helps").max(4000),
});

function ContactPage() {
  const { data: profile } = useQuery(publicQueries.profile());
  const { data: links = [] } = useQuery(publicQueries.socialLinks());
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    setSending(false);
    if (error) {
      toast.error("Unable to send your message. Please try again.");
      return;
    }
    toast.success("Message sent — I'll get back to you.");
    setForm({ name: "", email: "", message: "" });
  }

  const field =
    "mt-1.5 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <SiteLayout>
      <div className="mx-auto grid max-w-4xl gap-12 px-5 pt-16 pb-10 md:grid-cols-[1fr_16rem]">
        <div>
          <h1 className="text-3xl">Get in touch</h1>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Tell me a bit about what you're working on. I read everything that comes through here.
          </p>

          <form onSubmit={submit} className="mt-8 max-w-lg space-y-5">
            <div>
              <label htmlFor="name" className="text-sm">
                Name
              </label>
              <input
                id="name"
                className={field}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors["name"] && (
                <p className="mt-1 text-xs text-destructive">{errors["name"]}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="text-sm">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={field}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors["email"] && (
                <p className="mt-1 text-xs text-destructive">{errors["email"]}</p>
              )}
            </div>
            <div>
              <label htmlFor="message" className="text-sm">
                Message
              </label>
              <textarea
                id="message"
                rows={6}
                className={field}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              {errors["message"] && (
                <p className="mt-1 text-xs text-destructive">{errors["message"]}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={sending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>

        <aside className="space-y-6 text-sm md:border-l md:border-border md:pl-8">
          {profile?.email ? (
            <div>
              <p className="label-mono">Email</p>
              <a href={`mailto:${profile.email}`} className="mt-1 block hover:text-primary">
                {profile.email}
              </a>
            </div>
          ) : null}
          {profile?.location ? (
            <div>
              <p className="label-mono">Based in</p>
              <p className="mt-1">{profile.location}</p>
            </div>
          ) : null}
          {links.length > 0 && (
            <div>
              <p className="label-mono">Elsewhere</p>
              <ul className="mt-1 space-y-1">
                {links.map((l) => (
                  <li key={l.id}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </SiteLayout>
  );
}

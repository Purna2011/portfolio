import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
  Award,
  Briefcase,
  ExternalLink,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Link2,
  Loader2,
  LogOut,
  Settings,
  Sparkles,
  User,
  UserSquare2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Btn, inputClass } from "@/components/admin/admin-kit";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Portfolio Control Center" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Private portfolio administration." },
    ],
  }),
  component: AdminLayout,
});

const navItems: { to: string; label: string; icon: typeof User; exact?: boolean }[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/profile", label: "Profile", icon: User },
  { to: "/admin/about", label: "About", icon: UserSquare2 },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/skills", label: "Skills", icon: Sparkles },
  { to: "/admin/experience", label: "Experience", icon: Briefcase },
  { to: "/admin/education", label: "Education", icon: GraduationCap },
  { to: "/admin/certifications", label: "Certifications", icon: Award },
  { to: "/admin/social", label: "Social links", icon: Link2 },
  { to: "/admin/resume", label: "Resume", icon: FileText },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) setIsAdmin(null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    supabase
      .from("user_roles")
      .select("role")
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsAdmin(Boolean(data));
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) return <SignIn />;

  if (isAdmin === false) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <div>
          <h1 className="text-xl">This account can't edit the portfolio.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only the portfolio owner has access to this area.
          </p>
        </div>
        <Btn variant="outline" onClick={signOut}>
          Sign out
        </Btn>
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="border-b border-sidebar-border px-5 py-4">
          <p className="label-mono">Portfolio</p>
          <p className="text-sm font-semibold">Control Center</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-sidebar-border p-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" /> Preview website
          </a>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-border px-4 py-2 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="whitespace-nowrap rounded px-2 py-1 text-xs text-muted-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
          <button onClick={signOut} className="whitespace-nowrap px-2 py-1 text-xs">
            Log out
          </button>
        </div>
        <div className="mx-auto max-w-4xl px-5 py-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) toast.error(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setBusy(false);
      if (error) toast.error(error.message);
      else if (!data.session) toast.success("Check your email to confirm your account.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <p className="label-mono">Portfolio</p>
        <h1 className="mt-1 text-2xl">Control Center</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "in"
            ? "Sign in to manage your portfolio content."
            : "Create the owner account. Only the first account gets edit access."}
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="email" className="text-sm">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className={`${inputClass} mt-1.5`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "in" ? "current-password" : "new-password"}
              className={`${inputClass} mt-1.5`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Btn type="submit" disabled={busy} className="w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "in" ? "Log in" : "Create owner account"}
          </Btn>
        </form>

        <button
          onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="mt-5 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {mode === "in" ? "First time here? Create the owner account" : "Back to log in"}
        </button>
      </div>
    </div>
  );
}

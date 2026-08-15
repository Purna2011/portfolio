import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { publicQueries } from "@/lib/portfolio";

const nav = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { data: profile } = useQuery(publicQueries.profile());
  const { data: resume } = useQuery(publicQueries.activeResume());

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link to="/" className="font-mono text-sm font-medium tracking-tight">
          {profile?.full_name || "Portfolio"}
        </Link>
        <nav className="flex items-center gap-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="rounded px-2.5 py-1.5 text-sm transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          {resume?.file_url ? (
            <a
              href={resume.file_url}
              target="_blank"
              rel="noreferrer"
              className="ml-2 hidden rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary hover:text-primary sm:inline-flex"
            >
              Resume
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { data: profile } = useQuery(publicQueries.profile());
  const { data: links } = useQuery(publicQueries.socialLinks());

  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {profile?.full_name || ""}
        </p>
        <div className="flex flex-wrap gap-4">
          {(links ?? []).map((l) => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

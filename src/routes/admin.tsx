import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";
import { CrudPanel, type Field } from "@/components/admin/CrudPanel";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Vertex Dev" },
      { name: "description", content: "Vertex Dev content dashboard." },
      { property: "og:title", content: "Admin — Vertex Dev" },
      { property: "og:description", content: "Vertex Dev content dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  ssr: false,
  component: Admin,
});

const input = "w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm outline-none focus:border-foreground";

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email")), password = String(fd.get("password"));
    setBusy(true);
    const { error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setBusy(false);
    if (error) toast.error(error.message);
    else if (mode === "up") toast.success("Check your email to confirm your account.");
  }
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl border-[3px] border-foreground p-8">
        <Logo className="h-9" />
        <h1 className="font-display text-3xl uppercase">{mode === "in" ? "Admin sign in" : "Create admin"}</h1>
        <input name="email" type="email" required placeholder="Email" className={input} />
        <input name="password" type="password" required minLength={8} placeholder="Password" className={input} />
        <button disabled={busy} className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground">{mode === "in" ? "Sign in" : "Sign up"}</button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-sm text-muted-foreground underline">
          {mode === "in" ? "First time? Create the admin account" : "Have an account? Sign in"}
        </button>
        <p className="text-xs text-muted-foreground">Only the first account created becomes admin.</p>
      </form>
    </div>
  );
}

function ContentPanel() {
  const qc = useQueryClient();
  const [rows, setRows] = useState<{ key: string; value: string }[]>([]);
  useEffect(() => { supabase.from("site_content").select("key,value").order("key").then(({ data }) => setRows(data ?? [])); }, []);
  async function save(key: string, value: string) {
    const { error } = await supabase.from("site_content").upsert({ key, value });
    if (error) toast.error(error.message); else { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["site_content"] }); }
  }
  const labels: Record<string, string> = {
    hero_tagline: "Hero tagline", hero_cta: "Hero button text", about_intro: "About intro", about_philosophy: "About philosophy",
    process: "Process steps (one per line: Title — description)", footer_text: "Footer description", cta_heading: "Homepage CTA heading",
    whatsapp: "WhatsApp number (international, digits only)", email: "Contact email",
  };
  return (
    <div className="space-y-5">
      {rows.map((r) => (
        <label key={r.key} className="block text-sm font-semibold">
          <span className="mb-1 block">{labels[r.key] ?? r.key}</span>
          <textarea rows={r.value.length > 80 ? 5 : 1} defaultValue={r.value} className={input} onBlur={(e) => e.target.value !== r.value && save(r.key, e.target.value)} />
        </label>
      ))}
      <p className="text-xs text-muted-foreground">Changes save when you click out of a field.</p>
    </div>
  );
}

const projectFields: Field[] = [
  { key: "title", label: "Title", type: "text" }, { key: "slug", label: "URL slug (e.g. optimo-auto)", type: "text" },
  { key: "industry", label: "Industry", type: "text" }, { key: "client", label: "Client", type: "text" },
  { key: "year", label: "Year", type: "number" }, { key: "live_url", label: "Live website URL (leave empty to hide)", type: "text" },
  { key: "summary", label: "Short description", type: "textarea" }, { key: "cover_url", label: "Cover image", type: "image" },
  { key: "overview", label: "Overview", type: "textarea" }, { key: "challenge", label: "Challenge", type: "textarea" },
  { key: "approach", label: "Our approach / solution", type: "textarea" }, { key: "design_process", label: "Design process", type: "textarea" },
  { key: "dev_process", label: "Development process", type: "textarea" }, { key: "result", label: "Result", type: "textarea" },
  { key: "features", label: "Key features", type: "list" }, { key: "technologies", label: "Technologies", type: "list" },
  { key: "gallery", label: "Gallery", type: "gallery" },
  { key: "published", label: "Published", type: "bool" }, { key: "featured", label: "Featured on homepage", type: "bool" },
];
const serviceFields: Field[] = [
  { key: "title", label: "Title", type: "text" }, { key: "tagline", label: "Tagline", type: "text" },
  { key: "description", label: "Description", type: "textarea" }, { key: "features", label: "Features", type: "list" },
  { key: "image_url", label: "Image", type: "image" }, { key: "published", label: "Published", type: "bool" },
];

function Dashboard({ session }: { session: Session }) {
  const [tab, setTab] = useState<"projects" | "reviews" | "services" | "content">("projects");
  const [projects, setProjects] = useState<{ value: string; label: string }[]>([]);
  useEffect(() => { supabase.from("projects").select("id,title").then(({ data }) => setProjects((data ?? []).map((p) => ({ value: p.id, label: p.title })))); }, [tab]);
  const reviewFields: Field[] = [
    { key: "client_name", label: "Client name", type: "text" }, { key: "company", label: "Company", type: "text" },
    { key: "rating", label: "Rating (1-5)", type: "number" }, { key: "project_id", label: "Related project", type: "select", options: projects },
    { key: "body", label: "Review", type: "textarea" }, { key: "avatar_url", label: "Profile image", type: "image" },
    { key: "published", label: "Published", type: "bool" },
  ];
  const tabs = ["projects", "reviews", "services", "content"] as const;
  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="flex min-w-0 items-center gap-4"><Link to="/"><Logo className="h-8" /></Link><span className="truncate text-sm text-muted-foreground">{session.user.email}</span></div>
        <button onClick={() => supabase.auth.signOut()} className="rounded-full border-2 border-foreground px-4 py-1.5 text-sm font-semibold">Sign out</button>
      </header>
      <nav className="mt-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-5 py-2 font-display uppercase ${tab === t ? "bg-primary text-primary-foreground" : "bg-card"}`}>{t}</button>
        ))}
      </nav>
      <div className="mt-8">
        {tab === "projects" && <CrudPanel key="p" table="projects" fields={projectFields} titleKey="title" publicKeys={["projects", "project"]}
          blank={{ title: "", slug: "", summary: "", industry: "", published: false, featured: false, features: [], technologies: [], gallery: [] }} />}
        {tab === "reviews" && <CrudPanel key="r" table="reviews" fields={reviewFields} titleKey="client_name" publicKeys={["reviews"]}
          blank={{ client_name: "", company: "", body: "", rating: 5, published: true }} />}
        {tab === "services" && <CrudPanel key="s" table="services" fields={serviceFields} titleKey="title" publicKeys={["services"]}
          blank={{ title: "", tagline: "", description: "", features: [], published: true }} />}
        {tab === "content" && <ContentPanel />}
      </div>
    </div>
  );
}

function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }

    let cancelled = false;

    const checkAdmin = async () => {
      // Use the security-definer has_role() function instead of reading
      // user_roles directly. This avoids RLS/session-policy issues while
      // still checking the authenticated user's actual database role.
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });

      if (cancelled) return;

      if (error) {
        console.error("[Admin] Failed to check admin role:", error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data === true);
    };

    checkAdmin();

    return () => {
      cancelled = true;
    };
  }, [session]);

  if (session === undefined) return <div className="p-10">Loading…</div>;
  if (!session) return <Login />;
  if (isAdmin === null) return <div className="p-10">Checking access…</div>;
  if (!isAdmin) return (
    <div className="grid min-h-screen place-items-center p-5 text-center">
      <div><h1 className="font-display text-4xl uppercase">No access</h1><p className="mt-2 text-muted-foreground">This account isn't an admin.</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-4 underline">Sign out</button></div>
    </div>
  );
  return <Dashboard session={session} />;
}

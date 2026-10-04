import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useContact } from "./ContactDialog";

const links = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const { open } = useContact();
  const [menu, setMenu] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-7">
        <Link to="/" aria-label="Vertex Dev home"><Logo className="h-7 sm:h-8" /></Link>
        <nav className="hidden items-center gap-10 text-sm md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={{ exact: l.to === "/" }}
              className="text-muted-foreground transition hover:text-foreground data-[status=active]:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => open()} className="rounded-full bg-primary px-4 py-2 font-condensed text-base tracking-wide text-primary-foreground transition hover:-translate-y-0.5">
            CONTACT US
          </button>
          <button className="grid h-10 w-10 place-items-center md:hidden" onClick={() => setMenu(!menu)} aria-label="Menu">
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {menu && (
        <nav className="border-t border-border bg-background px-5 pb-6 md:hidden">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMenu(false)}
              className="block border-b border-border py-4 font-display text-3xl uppercase">
              {l.label}
            </Link>
          ))}
          <button onClick={() => { setMenu(false); open(); }} className="block py-4 font-display text-3xl uppercase">Contact</button>
        </nav>
      )}
    </header>
  );
}

import { Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Logo } from "./Logo";
import { useContact } from "./ContactDialog";
import { type SiteContent, siteContentQuery, WHATSAPP_DEFAULT } from "@/lib/content";

export function SiteFooter() {
  const { open } = useContact();
  const { data } = useSuspenseQuery(siteContentQuery);
  const c: SiteContent = data ?? {};
  const wa = c.whatsapp || WHATSAPP_DEFAULT;
  const email = c.email || "hello@vertexdev.studio";
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 text-sm sm:px-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo inverted className="h-10" />
          <p className="mt-5 max-w-sm text-ink-muted">{c.footer_text}</p>
          <button onClick={() => open()} className="mt-6 rounded-full bg-ink-foreground px-5 py-2 font-condensed text-base tracking-wide text-ink">
            START A PROJECT
          </button>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider">Studio</h3>
          <ul className="mt-3 space-y-1.5 text-ink-muted">
            <li><Link to="/projects" className="hover:text-ink-foreground">Projects</Link></li>
            <li><Link to="/services" className="hover:text-ink-foreground">Services</Link></li>
            <li><Link to="/about" className="hover:text-ink-foreground">About</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider">Services</h3>
          <ul className="mt-3 space-y-1.5 text-ink-muted">
            <li>Car showrooms</li><li>E-commerce</li><li>Business websites</li><li>Website management</li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider">Contact</h3>
          <ul className="mt-3 space-y-1.5 text-ink-muted">
            <li><a href={`https://wa.me/${wa}`} target="_blank" rel="noopener" className="hover:text-ink-foreground">WhatsApp +{wa}</a></li>
            <li><a href={`mailto:${email}`} className="hover:text-ink-foreground">{email}</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl border-t border-ink-muted/30 px-5 py-5 text-xs text-ink-muted sm:px-10">
        © {new Date().getFullYear()} VERTEX-DEV. All rights reserved.
      </div>
    </footer>
  );
}

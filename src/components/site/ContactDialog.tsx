import { createContext, useContext, useState, type ReactNode } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { siteContentQuery, WHATSAPP_DEFAULT } from "@/lib/content";

const Ctx = createContext<{ open: (service?: string) => void }>({ open: () => {} });
export const useContact = () => useContext(Ctx);

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  business: z.string().trim().max(120).optional(),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a phone or WhatsApp number").max(30).regex(/^[+\d\s()-]+$/, "Digits only"),
  service: z.string().min(1, "Pick a service"),
  budget: z.string().optional(),
  details: z.string().trim().min(10, "Tell us a little about the project").max(2000),
  extra: z.string().trim().max(1000).optional(),
});

const SERVICES = ["Automotive showroom website", "E-commerce store", "Business website", "Landing page", "Website redesign", "Website management", "Other"];

const field = "w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground";

export function ContactProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [preset, setPreset] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: content } = useSuspenseQuery(siteContentQuery);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const res = schema.safeParse(raw);
    if (!res.success) {
      const errs: Record<string, string> = {};
      res.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    const d = res.data;
    const msg = [
      "Hi Vertex Dev, I'd like to discuss a website project.",
      "",
      `Name: ${d.name}`,
      `Business: ${d.business || "-"}`,
      `Email: ${d.email}`,
      `Phone: ${d.phone}`,
      `Service: ${d.service}`,
      `Budget: ${d.budget || "-"}`,
      `Project details: ${d.details}`,
      d.extra ? `Additional info: ${d.extra}` : "",
    ].filter((l, i, a) => l !== "" || i === 1 || a[i - 1] !== "").join("\n");
    const num = (content?.whatsapp || WHATSAPP_DEFAULT).replace(/\D/g, "");
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    setOpen(false);
  }

  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>;

  return (
    <Ctx.Provider value={{ open: (s) => { setPreset(s ?? ""); setErrors({}); setOpen(true); } }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border-2 border-foreground bg-background p-6 sm:max-w-2xl sm:p-8">
          <DialogHeader>
            <DialogTitle className="font-display text-4xl uppercase tracking-tight sm:text-5xl">Start a project.</DialogTitle>
            <DialogDescription>Tell us what you need. We'll pick it up on WhatsApp — straight with the founders.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} noValidate className="mt-2 grid gap-4 sm:grid-cols-2">
            <div><input name="name" placeholder="Your name *" className={field} />{err("name")}</div>
            <div><input name="business" placeholder="Business / company" className={field} /></div>
            <div><input name="email" type="email" placeholder="Email *" className={field} />{err("email")}</div>
            <div><input name="phone" placeholder="Phone / WhatsApp *" className={field} />{err("phone")}</div>
            <div>
              <select name="service" defaultValue={preset} key={preset} className={field}>
                <option value="" disabled>Type of website *</option>
                {SERVICES.map((s) => <option key={s}>{s}</option>)}
              </select>{err("service")}
            </div>
            <div>
              <input name="budget" placeholder="Budget (optional) — enter your budget..." className={field} />
            </div>
            <div className="sm:col-span-2"><textarea name="details" rows={4} placeholder="What do you need? *" className={field} />{err("details")}</div>
            <div className="sm:col-span-2"><textarea name="extra" rows={2} placeholder="Anything else? (links, deadlines…)" className={field} /></div>
            <button type="submit" className="sm:col-span-2 rounded-full bg-primary px-6 py-4 font-display text-lg uppercase tracking-wide text-primary-foreground transition hover:-translate-y-0.5">
              Send Project Request →
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}

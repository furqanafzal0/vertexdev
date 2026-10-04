import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type Field =
  | { key: string; label: string; type: "text" | "textarea" | "number" | "bool" | "list" | "image" | "gallery" }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[] };

type Table = "projects" | "reviews" | "services";
type Row = Record<string, any> & { id: string; sort_order: number };

const input = "w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm outline-none focus:border-foreground";

export async function uploadImage(file: File): Promise<string | null> {
  const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
  const { error } = await supabase.storage.from("media").upload(path, file);
  if (error) { toast.error(error.message); return null; }
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 20);
  if (e2) { toast.error(e2.message); return null; }
  return data.signedUrl;
}

function ImageInput({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div className="flex items-center gap-3">
      {value && <img src={value} alt="" className="h-16 w-24 rounded-lg object-cover" />}
      <input type="file" accept="image/*" className="text-sm" onChange={async (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        const url = await uploadImage(f); if (url) onChange(url);
      }} />
      {value && <button type="button" className="text-sm text-destructive" onClick={() => onChange(null)}>Remove</button>}
    </div>
  );
}

export function CrudPanel({ table, fields, titleKey, blank, publicKeys }: {
  table: Table; fields: Field[]; titleKey: string; blank: Record<string, any>; publicKeys: string[];
}) {
  const qc = useQueryClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [edit, setEdit] = useState<Record<string, any> | null>(null);

  async function load() {
    const { data, error } = await supabase.from(table).select("*").order("sort_order");
    if (error) toast.error(error.message); else setRows(data as Row[]);
  }
  useEffect(() => { load(); }, [table]);
  const refresh = () => { load(); publicKeys.forEach((k) => qc.invalidateQueries({ queryKey: [k] })); };

  async function save() {
    if (!edit) return undefined;
    const { id, created_at, ...rest } = edit;
    const res = id
      ? await supabase.from(table).update(rest as never).eq("id", id)
      : await supabase.from(table).insert({ ...rest, sort_order: (rows.at(-1)?.sort_order ?? 0) + 1 } as never);
    if (res.error) return toast.error(res.error.message);
    toast.success("Saved"); setEdit(null); refresh();
    return undefined;
  }
  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) toast.error(error.message); else refresh();
  }
  async function move(i: number, dir: -1 | 1) {
    const a = rows[i], b = rows[i + dir]; if (!a || !b) return;
    await supabase.from(table).update({ sort_order: b.sort_order } as never).eq("id", a.id);
    await supabase.from(table).update({ sort_order: a.sort_order } as never).eq("id", b.id);
    refresh();
  }
  async function toggle(r: Row, key: string) {
    await supabase.from(table).update({ [key]: !r[key] } as never).eq("id", r.id); refresh();
  }

  const set = (k: string, v: any) => setEdit((e) => ({ ...e!, [k]: v }));

  return (
    <div>
      <button onClick={() => setEdit({ ...blank })} className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
        <Plus className="h-4 w-4" /> Add new
      </button>

      {edit && (
        <div className="mb-8 rounded-3xl border-2 border-foreground bg-popover p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((f) => (
              <label key={f.key} className={`block text-sm font-semibold ${["textarea", "list", "gallery"].includes(f.type) ? "md:col-span-2" : ""}`}>
                <span className="mb-1 block">{f.label}</span>
                {f.type === "text" && <input className={input} value={edit[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />}
                {f.type === "number" && <input type="number" className={input} value={edit[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value ? Number(e.target.value) : null)} />}
                {f.type === "textarea" && <textarea rows={4} className={input} value={edit[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />}
                {f.type === "list" && <textarea rows={4} className={input} placeholder="One per line" value={(edit[f.key] ?? []).join("\n")} onChange={(e) => set(f.key, e.target.value.split("\n"))} onBlur={(e) => set(f.key, e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />}
                {f.type === "bool" && <input type="checkbox" className="h-5 w-5" checked={!!edit[f.key]} onChange={(e) => set(f.key, e.target.checked)} />}
                {f.type === "image" && <ImageInput value={edit[f.key]} onChange={(v) => set(f.key, v)} />}
                {f.type === "select" && (
                  <select className={input} value={edit[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value || null)}>
                    <option value="">— none —</option>
                    {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                )}
                {f.type === "gallery" && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(edit[f.key] ?? []).map((u: string) => (
                        <div key={u} className="relative">
                          <img src={u} alt="" className="h-20 w-32 rounded-lg object-cover" />
                          <button type="button" onClick={() => set(f.key, edit[f.key].filter((x: string) => x !== u))} className="absolute right-1 top-1 rounded-full bg-destructive px-2 text-xs text-destructive-foreground">×</button>
                        </div>
                      ))}
                    </div>
                    <input type="file" accept="image/*" multiple className="text-sm" onChange={async (e) => {
                      const files = Array.from(e.target.files ?? []);
                      const urls = (await Promise.all(files.map(uploadImage))).filter(Boolean) as string[];
                      setEdit((x) => ({ ...x!, [f.key]: [...(x![f.key] ?? []), ...urls] }));
                    }} />
                  </div>
                )}
              </label>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={save} className="rounded-full bg-primary px-6 py-2 font-semibold text-primary-foreground">Save</button>
            <button onClick={() => setEdit(null)} className="rounded-full border-2 border-foreground px-6 py-2 font-semibold">Cancel</button>
          </div>
        </div>
      )}

      <ul className="space-y-3">
        {rows.map((r, i) => (
          <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-card px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-semibold">{r[titleKey]}</p>
              <div className="mt-1 flex flex-wrap gap-3 text-xs">
                <button onClick={() => toggle(r, "published")} className="underline">{r["published"] ? "Published" : "Hidden"}</button>
                {"featured" in r && <button onClick={() => toggle(r, "featured")} className="underline">{r["featured"] ? "★ Featured" : "Not featured"}</button>}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button aria-label="Move up" onClick={() => move(i, -1)} className="p-2"><ArrowUp className="h-4 w-4" /></button>
              <button aria-label="Move down" onClick={() => move(i, 1)} className="p-2"><ArrowDown className="h-4 w-4" /></button>
              <button aria-label="Edit" onClick={() => setEdit(r)} className="p-2"><Pencil className="h-4 w-4" /></button>
              <button aria-label="Delete" onClick={() => remove(r.id)} className="p-2 text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

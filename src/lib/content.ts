import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import optimo from "@/assets/project-optimo.jpg";
import tevion from "@/assets/project-tevion.jpg";
import coconut from "@/assets/project-coconut.jpg";

export type Project = Tables<"projects">;
export type Review = Tables<"reviews">;
export type Service = Tables<"services">;

const fallbackCovers: Record<string, string> = {
  "optimo-auto": optimo,
  "tevion-clothing": tevion,
  "coco-nut": coconut,
};
export const coverFor = (p: Pick<Project, "cover_url" | "slug">) =>
  p.cover_url || fallbackCovers[p.slug] || optimo;

export type SiteContent = Partial<Record<"hero_tagline"|"hero_cta"|"about_intro"|"about_philosophy"|"process"|"footer_text"|"cta_heading"|"whatsapp"|"email", string>>;

export const WHATSAPP_DEFAULT = "923184130174";

export const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("projects").select("*").eq("published", true).order("sort_order");
    if (error) throw error;
    return data;
  },
});

export const projectQuery = (slug: string) =>
  queryOptions({
    queryKey: ["project", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects").select("*").eq("slug", slug).eq("published", true).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const reviewsQuery = queryOptions({
  queryKey: ["reviews"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("reviews").select("*").eq("published", true).order("sort_order");
    if (error) throw error;
    return data;
  },
});

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("services").select("*").eq("published", true).order("sort_order");
    if (error) throw error;
    return data;
  },
});

export const siteContentQuery = queryOptions({
  queryKey: ["site_content"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_content").select("key,value");
    if (error) throw error;
    return Object.fromEntries(data.map((r) => [r.key, r.value])) as SiteContent;
  },
});

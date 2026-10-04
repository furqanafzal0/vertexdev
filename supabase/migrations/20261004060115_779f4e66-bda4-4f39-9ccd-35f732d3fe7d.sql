create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.handle_first_admin() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users for each row execute function public.handle_first_admin();

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique, title text not null, summary text not null default '', industry text not null default '',
  client text, year int, cover_url text, gallery text[] not null default '{}', technologies text[] not null default '{}',
  features text[] not null default '{}', overview text not null default '', challenge text not null default '', approach text not null default '',
  design_process text not null default '', dev_process text not null default '', result text not null default '', live_url text,
  published boolean not null default true, featured boolean not null default false, sort_order int not null default 0,
  created_at timestamptz not null default now());
create table public.reviews (
  id uuid primary key default gen_random_uuid(), client_name text not null, company text not null default '', body text not null,
  rating int not null default 5, avatar_url text, project_id uuid references public.projects(id) on delete set null,
  published boolean not null default true, sort_order int not null default 0, created_at timestamptz not null default now());
create table public.services (
  id uuid primary key default gen_random_uuid(), title text not null, tagline text not null default '', description text not null default '',
  features text[] not null default '{}', image_url text, published boolean not null default true, sort_order int not null default 0,
  created_at timestamptz not null default now());
create table public.site_content (key text primary key, value text not null default '', updated_at timestamptz not null default now());

grant select on public.projects, public.reviews, public.services, public.site_content to anon, authenticated;
grant insert, update, delete on public.projects, public.reviews, public.services, public.site_content to authenticated;
grant all on public.projects, public.reviews, public.services, public.site_content to service_role;
alter table public.projects enable row level security; alter table public.reviews enable row level security;
alter table public.services enable row level security; alter table public.site_content enable row level security;

create policy "public read published" on public.projects for select using (published or public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.projects for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "public read published" on public.reviews for select using (published or public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.reviews for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "public read published" on public.services for select using (published or public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.services for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "public read" on public.site_content for select using (true);
create policy "admin write" on public.site_content for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "media admin insert" on storage.objects for insert to authenticated with check (bucket_id='media' and public.has_role(auth.uid(),'admin'));
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id='media' and public.has_role(auth.uid(),'admin'));
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id='media' and public.has_role(auth.uid(),'admin'));

insert into public.projects (slug,title,summary,industry,client,year,featured,sort_order,technologies,features,overview,challenge,approach,design_process,dev_process,result) values
('optimo-auto','Optimo-Auto','A modern car showroom website to showcase vehicles, prices and specifications.','Automotive Showroom','Optimo Auto',2025,true,1,'{React,TypeScript,Postgres}','{"Inventory with filters","Vehicle detail pages","WhatsApp enquiries","Admin inventory manager"}',
 'A premium showroom website designed to put inventory front and centre with high-quality imagery, detailed vehicle information and an easy enquiry experience.',
 'Their stock lived across social posts and spreadsheets. Buyers could not see what was available or compare specs without phoning in.',
 'We built a fast, image-first inventory where every vehicle has its own page, and every page ends in a one-tap WhatsApp enquiry.',
 'Dark, cinematic layouts that let the cars do the talking. Big imagery, tight typography and clear pricing.',
 'A custom inventory system with search and filtering, optimised image delivery and a simple dashboard for the showroom team.',
 'Enquiries now arrive with the exact vehicle attached, and the team updates stock in minutes instead of hours.'),
('tevion-clothing','Tevion-Clothing','A conversion-focused store built around heavyweight essentials and a monochrome wardrobe.','E-commerce Store','Tevion',2025,true,2,'{React,Stripe,Postgres}','{"Product catalogue","Size & colour variants","WhatsApp order confirmation","Promo landing pages"}',
 'A conversion-focused online store designed around product discovery, smooth navigation and a streamlined purchasing experience.',
 'A strong brand with no home online beyond Instagram, and orders handled manually through DMs.',
 'A calm, editorial store that mirrors the brand: monochrome, heavyweight and quiet, with a checkout that confirms orders on WhatsApp.',
 'Editorial product photography, generous whitespace and a restrained type system.',
 'Product management, variant handling, cart and checkout integration with order notifications.',
 'Orders moved from DMs to a proper store with a clear catalogue and fewer back-and-forth messages.'),
('coco-nut','Coco-Nut','A playful brand website for a coconut drinks company — paradise in every sip.','Business Website','Coco-Nut',2024,true,3,'{React,Tailwind}','{"Brand storytelling","Product showcase","Stockist enquiries","Mobile-first layout"}',
 'A polished business website designed to communicate the brand, its products and where to find them.',
 'A young brand that needed to look established to land retail stockists.',
 'A warm, tropical site with bold type and illustrated product moments.',
 'Cream backgrounds, sun-yellow accents and big, confident headlines.',
 'Lightweight build focused on speed and a simple stockist enquiry flow.',
 'A site the founders now send to every retailer they pitch.');

insert into public.reviews (client_name,company,body,sort_order) values
('Placeholder — Hamza R.','Optimo Auto','Our inventory finally looks as good as the cars. Customers message us about a specific vehicle instead of asking what we have.',1),
('Placeholder — Sara K.','Tevion','They understood the brand straight away. Talking directly to the people building it made everything faster.',2),
('Placeholder — Bilal A.','Coco-Nut','Fast, honest and no fluff. The site loads instantly and we get compliments on it all the time.',3),
('Placeholder — Usman T.','Local Business','Clear timeline, clear pricing, and they kept updating the site for us after launch.',4);

insert into public.services (title,tagline,description,features,sort_order) values
('Automotive Showrooms','Our speciality','Showroom websites built around your inventory — and, if you want, we run the digital side for you.','{"Custom showroom website","Vehicle inventory system","Vehicle detail pages","High-quality galleries","Search & filters","WhatsApp enquiry integration","Inventory management","Professional vehicle photography","Image editing & uploads","Ongoing stock updates"}',1),
('E-commerce','Stores that sell','Online stores designed around product discovery and a smooth path to checkout.','{"Custom e-commerce website","Product catalogue & pages","Shopping cart","Checkout integrations","Product management","Search & filtering","Promotional landing pages","Analytics integration"}',2),
('Business Websites','Look the part','Websites for every other kind of business that wants to look credible and get enquiries.','{"Company websites","Landing pages","Portfolio websites","Service & booking websites","Website redesigns","Performance optimisation"}',3),
('Website Management','We handle it','Manage your own content, or let us do it. Ongoing care so your site never goes stale.','{"Content & product updates","Inventory & image updates","Technical monitoring","Performance improvements","Small design changes","Security & maintenance updates"}',4);

insert into public.site_content (key,value) values
('hero_tagline','WITH NO BS'),
('hero_cta','Start a Project'),
('about_intro','Founded in 2021, Vertex Dev is an independent web design and development studio built by two founders with a simple goal: create websites that don''t just exist online, but actually make businesses look and perform better.'),
('about_philosophy','No account managers, no handoffs, no fluff. You talk to the two people actually designing and building your site. We keep teams small so the work stays sharp.'),
('process','Discover — We learn your business, goals and customers.
Design — We shape the look, layout and content before a line of code.
Build — We develop a fast, responsive site you can manage.
Launch — We deploy, test and hand over.
Care — We stay on to update, improve and maintain.'),
('footer_text','Vertex Dev is a two-founder web design & development studio building modern, high-performing websites since 2021.'),
('cta_heading','Got a project in mind?'),
('whatsapp','923184130174'),
('email','hello@vertexdev.studio');
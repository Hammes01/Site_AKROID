-- =========================================================
-- AKROID / HERMON — Migration 0002
-- Tabelas de negócio: products, kits, projects, testimonials,
-- posts, leads e audit_logs
-- =========================================================

-- ---------------------------------------------------------
-- product_categories
-- ---------------------------------------------------------
create table public.product_categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    created_at timestamptz not null default now()
);

insert into public.product_categories (name, slug) values
    ('Módulos', 'modulos'),
    ('Inversores', 'inversores'),
    ('Estruturas', 'estruturas'),
    ('Cabos', 'cabos'),
    ('Conectores', 'conectores'),
    ('Proteções', 'protecoes');

-- ---------------------------------------------------------
-- products
-- ---------------------------------------------------------
create table public.products (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references public.organizations(id),
    category_id uuid references public.product_categories(id),
    name text not null,
    slug text not null unique,
    brand text,
    model text,
    description text,
    warranty text,
    main_image_url text,
    gallery jsonb default '[]'::jsonb,
    status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- product_documents (datasheets, manuais, garantias)
-- ---------------------------------------------------------
create table public.product_documents (
    id uuid primary key default gen_random_uuid(),
    product_id uuid not null references public.products(id) on delete cascade,
    label text not null, -- 'Datasheet', 'Manual', 'Garantia'
    file_url text not null,
    created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- kits
-- ---------------------------------------------------------
create table public.kits (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references public.organizations(id),
    name text not null,
    slug text not null unique,
    description text,
    power_kwp numeric(10,2),
    category text check (category in ('residencial', 'comercial', 'industrial')),
    price numeric(12,2),
    show_price boolean not null default false,
    status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
    is_featured boolean not null default false,
    main_image_url text,
    gallery jsonb default '[]'::jsonb,
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on column public.kits.show_price is 'Se false, o site exibe "Sob consulta" em vez do preço.';

-- ---------------------------------------------------------
-- kit_items (relacionamento kits <-> products)
-- ---------------------------------------------------------
create table public.kit_items (
    id uuid primary key default gen_random_uuid(),
    kit_id uuid not null references public.kits(id) on delete cascade,
    product_id uuid not null references public.products(id),
    quantity integer not null default 1,
    created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- projects (portfólio de instalações)
-- ---------------------------------------------------------
create table public.projects (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references public.organizations(id),
    title text not null,
    slug text not null unique,
    city text,
    state text,
    power_installed_kwp numeric(10,2),
    project_type text check (project_type in ('residencial', 'comercial', 'industrial')),
    module_count integer,
    inverter_brand text,
    client_name text,
    description text,
    video_url text,
    is_featured boolean not null default false,
    status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
    installed_at date,
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- project_media (fotos: antes/durante/depois)
-- ---------------------------------------------------------
create table public.project_media (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references public.projects(id) on delete cascade,
    url text not null,
    phase text check (phase in ('antes', 'durante', 'depois')),
    sort_order integer default 0,
    created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- testimonials
-- ---------------------------------------------------------
create table public.testimonials (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references public.organizations(id),
    client_name text not null,
    client_company text,
    city text,
    role text,
    content text,
    video_url text,
    photo_url text,
    rating smallint check (rating between 1 and 5),
    is_published boolean not null default false,
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- post_categories / posts (blog)
-- ---------------------------------------------------------
create table public.post_categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique
);

create table public.posts (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references public.organizations(id),
    category_id uuid references public.post_categories(id),
    title text not null,
    slug text not null unique,
    excerpt text,
    content text,
    cover_image_url text,
    author_id uuid references public.profiles(id),
    tags text[] default '{}',
    status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
    published_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- leads (mini CRM)
-- ---------------------------------------------------------
create table public.leads (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references public.organizations(id),
    name text not null,
    whatsapp text not null,
    city text,
    project_type text,
    source text default 'site', -- site, instagram, indicacao, whatsapp...
    status text not null default 'novo' check (status in ('novo', 'contatado', 'proposta', 'negociacao', 'fechado', 'perdido')),
    assigned_to uuid references public.profiles(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- lead_notes (histórico de interações com o lead)
-- ---------------------------------------------------------
create table public.lead_notes (
    id uuid primary key default gen_random_uuid(),
    lead_id uuid not null references public.leads(id) on delete cascade,
    author_id uuid references public.profiles(id),
    content text not null,
    created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- site_settings (chave/valor simples para configs gerais)
-- ---------------------------------------------------------
create table public.site_settings (
    key text primary key,
    value jsonb not null,
    updated_at timestamptz not null default now(),
    updated_by uuid references public.profiles(id)
);

-- ---------------------------------------------------------
-- audit_logs
-- ---------------------------------------------------------
create table public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id),
    action text not null, -- 'create', 'update', 'delete'
    table_name text not null,
    record_id uuid,
    changes jsonb,
    created_at timestamptz not null default now()
);

-- Função genérica de auditoria (trigger)
create or replace function public.log_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_record jsonb;
    v_record_id uuid;
begin
    -- Usa jsonb em vez de new.id/old.id diretamente, porque nem toda
    -- tabela auditada tem uma coluna "id" (ex: user_roles tem chave composta).
    v_record := case when TG_OP = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
    v_record_id := nullif(v_record->>'id', '')::uuid;

    insert into public.audit_logs (user_id, action, table_name, record_id, changes)
    values (auth.uid(), lower(TG_OP), TG_TABLE_NAME, v_record_id, v_record);

    return coalesce(new, old);
end;
$$;

-- Aplicando auditoria nas tabelas mais sensíveis
create trigger audit_kits after insert or update or delete on public.kits
    for each row execute function public.log_audit_event();
create trigger audit_projects after insert or update or delete on public.projects
    for each row execute function public.log_audit_event();
create trigger audit_leads after insert or update or delete on public.leads
    for each row execute function public.log_audit_event();
create trigger audit_products after insert or update or delete on public.products
    for each row execute function public.log_audit_event();
create trigger audit_user_roles after insert or update or delete on public.user_roles
    for each row execute function public.log_audit_event();

-- =========================================================
-- RLS
-- =========================================================
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_documents enable row level security;
alter table public.kits enable row level security;
alter table public.kit_items enable row level security;
alter table public.projects enable row level security;
alter table public.project_media enable row level security;
alter table public.testimonials enable row level security;
alter table public.post_categories enable row level security;
alter table public.posts enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.site_settings enable row level security;
alter table public.audit_logs enable row level security;

-- --- Leitura pública (site) para conteúdo publicado ---
create policy "public can read published products"
on public.products for select
to anon, authenticated
using (status = 'published');

create policy "public can read product categories"
on public.product_categories for select to anon, authenticated using (true);

create policy "public can read product documents of published products"
on public.product_documents for select
to anon, authenticated
using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));

create policy "public can read published kits"
on public.kits for select
to anon, authenticated
using (status = 'published');

create policy "public can read kit_items of published kits"
on public.kit_items for select
to anon, authenticated
using (exists (select 1 from public.kits k where k.id = kit_id and k.status = 'published'));

create policy "public can read published projects"
on public.projects for select
to anon, authenticated
using (status = 'published');

create policy "public can read media of published projects"
on public.project_media for select
to anon, authenticated
using (exists (select 1 from public.projects p where p.id = project_id and p.status = 'published'));

create policy "public can read published testimonials"
on public.testimonials for select
to anon, authenticated
using (is_published = true);

create policy "public can read published posts"
on public.posts for select
to anon, authenticated
using (status = 'published');

create policy "public can read post categories"
on public.post_categories for select to anon, authenticated using (true);

-- --- Leads: qualquer visitante pode CRIAR (formulário do site) ---
create policy "anyone can insert a lead"
on public.leads for insert
to anon, authenticated
with check (true);

-- --- Escrita administrativa (RBAC) ---
create policy "products.create can insert products"
on public.products for insert to authenticated with check (public.authorize('products.create'));
create policy "products.update can update products"
on public.products for update to authenticated using (public.authorize('products.update'));
create policy "products.delete can delete products"
on public.products for delete to authenticated using (public.authorize('products.delete'));
create policy "products.read can read all products"
on public.products for select to authenticated using (public.authorize('products.read'));

create policy "products.update can write product_documents"
on public.product_documents for all to authenticated
using (public.authorize('products.update')) with check (public.authorize('products.update'));

create policy "kits.create can insert kits"
on public.kits for insert to authenticated with check (public.authorize('kits.create'));
create policy "kits.update can update kits"
on public.kits for update to authenticated using (public.authorize('kits.update'));
create policy "kits.delete can delete kits"
on public.kits for delete to authenticated using (public.authorize('kits.delete'));
create policy "kits.read can read all kits"
on public.kits for select to authenticated using (public.authorize('kits.read'));

create policy "kits.update can write kit_items"
on public.kit_items for all to authenticated
using (public.authorize('kits.update')) with check (public.authorize('kits.update'));

create policy "projects.create can insert projects"
on public.projects for insert to authenticated with check (public.authorize('projects.create'));
create policy "projects.update can update projects"
on public.projects for update to authenticated using (public.authorize('projects.update'));
create policy "projects.delete can delete projects"
on public.projects for delete to authenticated using (public.authorize('projects.delete'));
create policy "projects.read can read all projects"
on public.projects for select to authenticated using (public.authorize('projects.read'));

create policy "projects.update can write project_media"
on public.project_media for all to authenticated
using (public.authorize('projects.update')) with check (public.authorize('projects.update'));

create policy "testimonials.create can insert testimonials"
on public.testimonials for insert to authenticated with check (public.authorize('testimonials.create'));
create policy "testimonials.update can update testimonials"
on public.testimonials for update to authenticated using (public.authorize('testimonials.update'));
create policy "testimonials.delete can delete testimonials"
on public.testimonials for delete to authenticated using (public.authorize('testimonials.delete'));
create policy "testimonials.read can read all testimonials"
on public.testimonials for select to authenticated using (public.authorize('testimonials.read'));

create policy "posts.create can insert posts"
on public.posts for insert to authenticated with check (public.authorize('posts.create'));
create policy "posts.update can update posts"
on public.posts for update to authenticated using (public.authorize('posts.update'));
create policy "posts.delete can delete posts"
on public.posts for delete to authenticated using (public.authorize('posts.delete'));
create policy "posts.read can read all posts"
on public.posts for select to authenticated using (public.authorize('posts.read'));

create policy "leads.read can read leads"
on public.leads for select to authenticated using (public.authorize('leads.read'));
create policy "leads.update can update leads"
on public.leads for update to authenticated using (public.authorize('leads.update'));
create policy "leads.delete can delete leads"
on public.leads for delete to authenticated using (public.authorize('leads.delete'));

create policy "leads.read can read lead_notes"
on public.lead_notes for select to authenticated using (public.authorize('leads.read'));
create policy "leads.update can write lead_notes"
on public.lead_notes for insert to authenticated with check (public.authorize('leads.update'));

create policy "system.manage can write site_settings"
on public.site_settings for all to authenticated
using (public.authorize('system.manage')) with check (public.authorize('system.manage'));
create policy "authenticated can read site_settings"
on public.site_settings for select to authenticated using (true);

-- audit_logs: só quem tem system.manage lê; ninguém edita/apaga manualmente
create policy "system.manage can read audit_logs"
on public.audit_logs for select to authenticated using (public.authorize('system.manage'));

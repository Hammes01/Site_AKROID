-- =========================================================
-- AKROID / HERMON — Migration 0001
-- Fundação: organizations, profiles, RBAC (roles/permissions)
-- =========================================================

-- ---------------------------------------------------------
-- Extensões necessárias
-- ---------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- organizations
-- Separa marca comercial (trade_name) de razão social (legal_name)
-- ---------------------------------------------------------
create table public.organizations (
    id uuid primary key default gen_random_uuid(),
    legal_name text not null,
    trade_name text not null,
    document text, -- CNPJ
    status text not null default 'active' check (status in ('active', 'inactive')),
    logo_url text,
    website text,
    email text,
    phone text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.organizations is 'Entidades jurídicas/comerciais. Ex: legal_name = Hermon Serviços e Importação LTDA., trade_name = AKROID Energia Solar.';

-- Seed inicial da organização atual
insert into public.organizations (legal_name, trade_name, status)
values ('Hermon Serviços e Importação LTDA.', 'AKROID Energia Solar', 'active');

-- ---------------------------------------------------------
-- profiles
-- Estende auth.users do Supabase com dados da aplicação
-- ---------------------------------------------------------
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    organization_id uuid not null references public.organizations(id),
    full_name text not null,
    email text not null,
    phone text,
    avatar_url text,
    status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
    is_owner boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil de cada usuário do painel administrativo. is_owner = dono absoluto, não pode ser removido via UI.';

-- Trigger: cria profile automaticamente quando um usuário se cadastra no Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, organization_id, full_name, email)
    values (
        new.id,
        (select id from public.organizations order by created_at limit 1),
        coalesce(new.raw_user_meta_data->>'full_name', new.email),
        new.email
    );
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ---------------------------------------------------------
-- roles
-- ---------------------------------------------------------
create table public.roles (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique, -- owner, admin, comercial, marketing, tecnico, editor, viewer
    name text not null,
    description text,
    created_at timestamptz not null default now()
);

insert into public.roles (slug, name, description) values
    ('owner', 'Owner', 'Acesso total, incluindo gerenciamento de usuários e roles'),
    ('admin', 'Administrador', 'Tudo, exceto gerenciar o owner'),
    ('comercial', 'Comercial', 'Kits, Leads e Clientes'),
    ('marketing', 'Marketing', 'Projetos, Posts e Depoimentos'),
    ('tecnico', 'Técnico', 'Projetos, Produtos e Datasheets'),
    ('editor', 'Editor', 'Conteúdo, sem permissão de exclusão'),
    ('viewer', 'Visualizador', 'Apenas leitura');

-- ---------------------------------------------------------
-- permissions
-- Padrão: modulo.acao
-- ---------------------------------------------------------
create table public.permissions (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    module text not null,
    action text not null,
    description text
);

insert into public.permissions (slug, module, action, description) values
    ('projects.read', 'projects', 'read', 'Visualizar projetos'),
    ('projects.create', 'projects', 'create', 'Criar projetos'),
    ('projects.update', 'projects', 'update', 'Editar projetos'),
    ('projects.delete', 'projects', 'delete', 'Excluir projetos'),

    ('kits.read', 'kits', 'read', 'Visualizar kits'),
    ('kits.create', 'kits', 'create', 'Criar kits'),
    ('kits.update', 'kits', 'update', 'Editar kits'),
    ('kits.delete', 'kits', 'delete', 'Excluir kits'),

    ('products.read', 'products', 'read', 'Visualizar produtos'),
    ('products.create', 'products', 'create', 'Criar produtos'),
    ('products.update', 'products', 'update', 'Editar produtos'),
    ('products.delete', 'products', 'delete', 'Excluir produtos'),

    ('leads.read', 'leads', 'read', 'Visualizar leads'),
    ('leads.update', 'leads', 'update', 'Atualizar status/pipeline de leads'),
    ('leads.delete', 'leads', 'delete', 'Excluir leads'),

    ('testimonials.read', 'testimonials', 'read', 'Visualizar depoimentos'),
    ('testimonials.create', 'testimonials', 'create', 'Criar depoimentos'),
    ('testimonials.update', 'testimonials', 'update', 'Editar depoimentos'),
    ('testimonials.delete', 'testimonials', 'delete', 'Excluir depoimentos'),

    ('posts.read', 'posts', 'read', 'Visualizar posts do blog'),
    ('posts.create', 'posts', 'create', 'Criar posts'),
    ('posts.update', 'posts', 'update', 'Editar posts'),
    ('posts.delete', 'posts', 'delete', 'Excluir posts'),

    ('users.manage', 'users', 'manage', 'Criar/editar/desativar usuários'),
    ('roles.manage', 'roles', 'manage', 'Gerenciar roles e permissões'),
    ('system.manage', 'system', 'manage', 'Configurações gerais do sistema');

-- ---------------------------------------------------------
-- role_permissions (N:N)
-- ---------------------------------------------------------
create table public.role_permissions (
    role_id uuid not null references public.roles(id) on delete cascade,
    permission_id uuid not null references public.permissions(id) on delete cascade,
    primary key (role_id, permission_id)
);

-- Owner e Admin recebem tudo
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.slug in ('owner', 'admin');

-- Comercial: kits (read) + leads (tudo) 
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.slug = 'comercial'
  and p.slug in ('kits.read', 'leads.read', 'leads.update', 'leads.delete');

-- Marketing: projetos + posts + depoimentos
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.slug = 'marketing'
  and p.slug like any (array['projects.%', 'posts.%', 'testimonials.%']);

-- Técnico: projetos + produtos
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.slug = 'tecnico'
  and p.slug like any (array['projects.%', 'products.%']);

-- Editor: conteúdo, sem delete
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.slug = 'editor'
  and p.slug in ('posts.read', 'posts.create', 'posts.update',
                 'projects.read', 'projects.create', 'projects.update',
                 'testimonials.read', 'testimonials.create', 'testimonials.update');

-- Viewer: somente leituras
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r, public.permissions p
where r.slug = 'viewer'
  and p.action = 'read';

-- ---------------------------------------------------------
-- user_roles (um usuário pode ter mais de um role, mas o normal é 1)
-- ---------------------------------------------------------
create table public.user_roles (
    user_id uuid not null references public.profiles(id) on delete cascade,
    role_id uuid not null references public.roles(id) on delete cascade,
    assigned_at timestamptz not null default now(),
    assigned_by uuid references public.profiles(id),
    primary key (user_id, role_id)
);

-- ---------------------------------------------------------
-- Função authorize(permission_slug)
-- Usada dentro das RLS policies de todas as tabelas
-- ---------------------------------------------------------
create or replace function public.authorize(permission_slug text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
    select exists (
        select 1
        from public.user_roles ur
        join public.role_permissions rp on rp.role_id = ur.role_id
        join public.permissions p on p.id = rp.permission_id
        where ur.user_id = auth.uid()
          and p.slug = permission_slug
    )
    or exists (
        -- Owner sempre passa, independente de role_permissions
        select 1 from public.profiles pr where pr.id = auth.uid() and pr.is_owner = true
    );
$$;

comment on function public.authorize is 'Verifica se o usuário autenticado possui a permissão informada, via RBAC. Owner sempre retorna true.';

-- ---------------------------------------------------------
-- RLS: habilitando nas tabelas desta migration
-- ---------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;

-- organizations: qualquer usuário autenticado pode ler (site precisa exibir dados)
create policy "authenticated can read organizations"
on public.organizations for select
to authenticated
using (true);

create policy "only system.manage can update organizations"
on public.organizations for update
to authenticated
using (public.authorize('system.manage'));

-- profiles: usuário vê o próprio perfil; quem tem users.manage vê todos
create policy "users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.authorize('users.manage'));

create policy "users can update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "users.manage can update any profile"
on public.profiles for update
to authenticated
using (public.authorize('users.manage'));

-- roles / permissions: leitura liberada para autenticados, escrita só roles.manage
create policy "authenticated can read roles"
on public.roles for select to authenticated using (true);

create policy "roles.manage can write roles"
on public.roles for all to authenticated
using (public.authorize('roles.manage'))
with check (public.authorize('roles.manage'));

create policy "authenticated can read permissions"
on public.permissions for select to authenticated using (true);

create policy "authenticated can read role_permissions"
on public.role_permissions for select to authenticated using (true);

create policy "roles.manage can write role_permissions"
on public.role_permissions for all to authenticated
using (public.authorize('roles.manage'))
with check (public.authorize('roles.manage'));

-- user_roles: users.manage pode gerenciar; usuário pode ver o próprio
create policy "users can read own role"
on public.user_roles for select
to authenticated
using (user_id = auth.uid() or public.authorize('users.manage'));

create policy "users.manage can write user_roles"
on public.user_roles for all
to authenticated
using (public.authorize('users.manage'))
with check (public.authorize('users.manage'));

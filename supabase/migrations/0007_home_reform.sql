-- Dados reais de cada case, exibidos na home.
alter table public.projects
    add column monthly_generation_kwh numeric(10,2) check (monthly_generation_kwh >= 0),
    add column inverter_type text check (inverter_type in ('inversor', 'microinversor'));

-- Depoimento dentro do case do cliente.
alter table public.testimonials
    add column project_id uuid references public.projects(id) on delete set null;

-- O que o preço do kit inclui (placas, inversor, instalação, estrutura).
alter table public.kits
    add column price_includes text[] not null default '{}';

-- Conta de luz antes e depois fica em tabela própria: a regra por linha impede que
-- visitantes leiam os valores enquanto o admin não ativar a exibição.
create table public.project_results (
    project_id uuid primary key references public.projects(id) on delete cascade,
    bill_before numeric(10,2) check (bill_before >= 0),
    bill_after numeric(10,2) check (bill_after >= 0),
    is_public boolean not null default false,
    updated_at timestamptz not null default now()
);

alter table public.project_results enable row level security;

create policy "public can read enabled project_results"
on public.project_results for select
to anon, authenticated
using (
    is_public
    and exists (select 1 from public.projects p where p.id = project_id and p.status = 'published')
);

create policy "projects.update can write project_results"
on public.project_results for all
to authenticated
using (public.authorize('projects.update'))
with check (public.authorize('projects.update'));

-- Quem edita kits pode enviar e remover a foto, só dentro da pasta kits/.
create policy "kits.update can upload kit photos"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'site-assets'
    and name like 'kits/%'
    and public.authorize('kits.update')
);

create policy "kits.update can delete kit photos"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'site-assets'
    and name like 'kits/%'
    and public.authorize('kits.update')
);

-- Dados que ajudam o vendedor a priorizar o contato.
alter table public.leads
    add column monthly_bill numeric(10,2) check (monthly_bill >= 0),
    add column kit_interest text;

-- Configurações comerciais públicas (WhatsApp, simulador, etc.), lidas por visitantes sem login.
create policy "public can read sales_config"
on public.site_settings for select
to anon
using (key = 'sales_config');

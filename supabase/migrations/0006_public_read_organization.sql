-- O site público lê a organização para gravar os leads (organization_id é obrigatório)
-- e para mostrar razão social e CNPJ no rodapé. Sem esta regra, visitantes sem login
-- não conseguem enviar o formulário de orçamento.
-- A escrita continua restrita a system.manage.
create policy "public can read active organizations"
on public.organizations for select
to anon
using (status = 'active');

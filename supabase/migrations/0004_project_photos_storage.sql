-- Permite que quem edita projetos envie e remova fotos, só dentro da pasta projects/.
-- O restante do bucket site-assets continua restrito a system.manage.
create policy "projects.update can upload project photos"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'site-assets'
    and name like 'projects/%'
    and public.authorize('projects.update')
);

create policy "projects.update can delete project photos"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'site-assets'
    and name like 'projects/%'
    and public.authorize('projects.update')
);

-- Permite que visitantes sem login leiam o vídeo do topo da home.
-- As demais configurações continuam visíveis só para usuários autenticados.
create policy "public can read hero_video"
on public.site_settings for select
to anon
using (key = 'hero_video');

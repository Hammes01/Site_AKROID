import { getUserPermissions } from '@/lib/permissions/getUserPermissions'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', permission: null },
  { label: 'Projetos', href: '/admin/projetos', permission: 'projects.read' },
  { label: 'Kits', href: '/admin/kits', permission: 'kits.read' },
  { label: 'Produtos', href: '/admin/produtos', permission: 'products.read' },
  { label: 'Leads', href: '/admin/leads', permission: 'leads.read' },
  { label: 'Depoimentos', href: '/admin/depoimentos', permission: 'testimonials.read' },
  { label: 'Posts', href: '/admin/posts', permission: 'posts.read' },
  { label: 'Usuários', href: '/admin/usuarios', permission: 'users.manage' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile, permissions } = await getUserPermissions()

  const visibleItems = NAV_ITEMS.filter(
    (item) => item.permission === null || permissions.includes(item.permission)
  )

  return (
    <div className="flex min-h-screen bg-slate-950">
      <aside className="w-56 shrink-0 border-r border-slate-800 p-4">
        <div className="mb-6 px-2">
          <p className="text-sm font-semibold text-white">AKROID</p>
          <p className="text-xs text-slate-500">Painel Admin</p>
        </div>

        <nav className="space-y-1">
          {visibleItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-8 border-t border-slate-800 pt-4 px-2">
          <p className="truncate text-xs text-slate-500">{profile?.email}</p>
        </div>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  )
}
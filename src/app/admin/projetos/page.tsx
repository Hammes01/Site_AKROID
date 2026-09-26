import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface Project {
  id: string
  title: string
  city: string | null
  state: string | null
  power_installed_kwp: number | null
  project_type: string | null
  status: string
  is_featured: boolean
}

export default async function ProjetosPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, title, city, state, power_installed_kwp, project_type, status, is_featured')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projetos</h1>
        <Link
          href="/admin/projetos/novo"
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
        >
          + Novo projeto
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Local</th>
              <th className="px-4 py-3">Potência</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {projects?.length ? (
              projects.map((project: Project) => (
                <tr key={project.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">
                    {project.title}
                    {project.is_featured && (
                      <span className="ml-2 rounded-full bg-amber-900 px-2 py-0.5 text-xs text-amber-300">
                        Destaque
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {project.city ? `${project.city}/${project.state}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {project.power_installed_kwp
                      ? `${project.power_installed_kwp} kWp`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-400 capitalize">
                    {project.project_type ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        project.status === 'published'
                          ? 'bg-emerald-900 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/projetos/${project.id}`}
                      className="text-slate-400 hover:text-white"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Nenhum projeto cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
import { SupabaseTemplateRepository } from '@/repository/supabaseTemplateRepository'
import { TemplateListView } from '@/components/TemplateListView/TemplateListView'

export default async function TemplatesPage() {
  const repo      = new SupabaseTemplateRepository()
  const templates = await repo.list()

  return (
    <main className="max-w-md mx-auto px-4 py-6 space-y-6">
      <h1 className="font-semibold text-lg">テンプレート管理</h1>
      <TemplateListView templates={templates} />
    </main>
  )
}

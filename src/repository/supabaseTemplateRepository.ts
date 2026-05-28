import { createServerClient } from '@/lib/supabase/server'
import type { ITemplateRepository } from './templateRepository'
import type { DrinkTemplate } from '@/lib/types'

export class SupabaseTemplateRepository implements ITemplateRepository {
  async list(): Promise<DrinkTemplate[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('drink_templates')
      .select('*')
      .order('created_at')
    if (error) throw error
    return (data ?? []).map(toTemplate)
  }

  async add(name: string, items: DrinkTemplate['items']): Promise<DrinkTemplate> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('drink_templates')
      .insert({ name, items })
      .select()
      .single()
    if (error) throw error
    return toTemplate(data)
  }

  async delete(id: string): Promise<void> {
    const supabase = await createServerClient()
    const { error } = await supabase
      .from('drink_templates')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}

function toTemplate(d: any): DrinkTemplate {
  return {
    id:     d.id,
    userId: d.user_id,
    name:   d.name,
    items:  d.items,
  }
}

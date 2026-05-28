'use server'

import { revalidatePath } from 'next/cache'
import { validateTemplate } from '@/domain/template'
import { SupabaseTemplateRepository } from '@/repository/supabaseTemplateRepository'
import type { DrinkTemplate } from '@/lib/types'

const repo = new SupabaseTemplateRepository()

export async function addTemplate(
  name: string,
  items: DrinkTemplate['items']
) {
  const result = validateTemplate({ name, items })
  if (!result.ok) throw new Error(result.error)

  await repo.add(name, items)
  revalidatePath('/templates')
}

export async function deleteTemplate(id: string) {
  await repo.delete(id)
  revalidatePath('/templates')
}

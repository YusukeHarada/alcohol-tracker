import type { DrinkTemplate } from '@/lib/types'

export interface ITemplateRepository {
  list(): Promise<DrinkTemplate[]>
  add(name: string, items: DrinkTemplate['items']): Promise<DrinkTemplate>
  delete(id: string): Promise<void>
}

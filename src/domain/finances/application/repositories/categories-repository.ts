import { Category } from '../../enterprise/entities/category'

export abstract class CategoriesRepository {
  abstract create(category: Category): Promise<void>
  abstract findByIdAndWalletId(id: string, walletId: string): Promise<Category | null>
  abstract findByWalletIdAndSlug(
    walletId: string,
    slug: string,
  ): Promise<Category | null>
  abstract findManyByWalletId(walletId: string): Promise<Category[]>
  abstract save(category: Category): Promise<Category>
  abstract deleteAllByWalletId(walletId: string): Promise<number>
}
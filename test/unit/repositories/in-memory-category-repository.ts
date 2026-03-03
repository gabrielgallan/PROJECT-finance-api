import { CategoriesRepository } from "@/domain/finances/application/repositories/categories-repository";
import { Category } from "@/domain/finances/enterprise/entities/category";

export class InMemoryCategoriesRepository implements CategoriesRepository {
    public items: Category[] = []

    async create(category: Category) {
        this.items.push(category)
        return
    }

    async findByIdAndWalletId(id: string, walletId: string) {
        const category = this.items.find((c) => {
            return c.id.toString() === id && c.walletId.toString() === walletId
        })

        return category ?? null
    }

    async findByWalletIdAndSlug(walletId: string, slug: string) {
        const category = this.items.find((c) => {
            return (c.walletId.toString() === walletId && c.slug.value === slug)
        })

        return category ?? null
    }

    async findManyByWalletId(walletId: string) {
        const categories = this.items.filter(c => c.walletId.toString() === walletId)

        return categories
    }

    async save(category: Category) {
        const categoryIndex = this.items.findIndex(c => c.id.toString() === category.id.toString())

        if (categoryIndex >= 0) {
            this.items[categoryIndex] = category
        }

        return category
    }

    async deleteAllByWalletId(walletId: string) {
        const originalLenght = this.items.length

        const remaining = this.items.filter(a => a.walletId.toString() !== walletId)

        this.items = remaining

        return originalLenght - remaining.length
    }
}
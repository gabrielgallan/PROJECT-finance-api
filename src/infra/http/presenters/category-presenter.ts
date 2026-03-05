import { Category } from "@/domain/finances/enterprise/entities/category";

export interface CategoryPresenterToHTTP {
    id: string
    name: string
    slug: string
    description: string | null
}

export class CategoryPresenter {
    static toHTTP(category: Category): CategoryPresenterToHTTP {
        return {
            id: category.id.toString(),
            name: category.name,
            slug: category.slug.value,
            description: category.description ?? null
        }
    }
}
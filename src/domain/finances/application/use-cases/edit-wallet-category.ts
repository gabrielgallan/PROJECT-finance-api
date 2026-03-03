import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { WalletsRepository } from '../repositories/wallets-repository'
import { CategoriesRepository } from '../repositories/categories-repository'
import { Category } from '@/domain/finances/enterprise/entities/category'
import { Slug } from '@/domain/finances/enterprise/entities/value-objects/slug'
import { CategoryAlreadyExistsError } from './errors/category-already-exists-error'
import { Injectable } from '@nestjs/common'

interface EditWalletCategoryUseCaseRequest {
  memberId: string
  slug: string
  name?: string
  description?: string
}

type EditWalletCategoryUseCaseResponse = Either<
  | ResourceNotFoundError
  | CategoryAlreadyExistsError,
  {
    category: Category
  }
>

@Injectable()
export class EditWalletCategoryUseCase {
  constructor(
    private walletsRepository: WalletsRepository,
    private categoriesRepository: CategoriesRepository,
  ) { }

  async execute({
    memberId,
    slug,
    name,
    description,
  }: EditWalletCategoryUseCaseRequest): Promise<EditWalletCategoryUseCaseResponse> {
    const wallet = await this.walletsRepository.findByHolderId(memberId)

    if (!wallet) {
      return left(new ResourceNotFoundError())
    }

    const category = await this.categoriesRepository.findByWalletIdAndSlug(
      wallet.id.toString(),
      slug,
    )

    if (!category) {
      return left(new ResourceNotFoundError())
    }

    if (name) {
      const nameSlug = Slug.createFromText(name)

      const categoryWithSameName =
        await this.categoriesRepository.findByWalletIdAndSlug(
          wallet.id.toString(),
          nameSlug.value,
        )

      if (categoryWithSameName) {
        return left(new CategoryAlreadyExistsError())
      }

      category.name = name
    }

    if (description) {
      category.description = description
    }

    await this.categoriesRepository.save(category)

    return right({
      category,
    })
  }
}

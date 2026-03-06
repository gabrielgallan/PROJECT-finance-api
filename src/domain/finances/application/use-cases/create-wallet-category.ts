import { Either, left, right } from '@/core/types/either'
import { WalletsRepository } from '../repositories/wallets-repository'
import { CategoriesRepository } from '../repositories/categories-repository'
import { Category } from '@/domain/finances/enterprise/entities/category'
import { Slug } from '@/domain/finances/enterprise/entities/value-objects/slug'
import { CategoryAlreadyExistsError } from './errors/category-already-exists-error'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

interface CreateWalletCategoryUseCaseRequest {
  memberId: string
  categoryName: string
  categoryDescription?: string
}

type CreateWalletCategoryUseCaseResponse = Either<
  | ResourceNotFoundError
  | CategoryAlreadyExistsError,
  {
    category: Category
  }
>

@Injectable()
export class CreateWalletCategoryUseCase {
  constructor(
    private walletsRepository: WalletsRepository,
    private categoriesRepository: CategoriesRepository,
  ) { }

  async execute({
    memberId,
    categoryName,
    categoryDescription,
  }: CreateWalletCategoryUseCaseRequest): Promise<CreateWalletCategoryUseCaseResponse> {
    const wallet = await this.walletsRepository.findByHolderId(memberId)

    if (!wallet) {
      return left(new ResourceNotFoundError())
    }

    const categorySlug = Slug.createFromText(categoryName)

    const walletCategoryWithSameSlug =
      await this.categoriesRepository.findByWalletIdAndSlug(
        wallet.id.toString(),
        categorySlug.value,
      )

    if (walletCategoryWithSameSlug) {
      return left(new CategoryAlreadyExistsError())
    }

    const category = Category.create({
      walletId: wallet.id,
      name: categoryName,
      slug: categorySlug,
      description: categoryDescription,
    })

    await this.categoriesRepository.create(category)

    return right({
      category,
    })
  }
}

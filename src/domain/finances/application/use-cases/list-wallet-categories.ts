import { Either, left, right } from '@/core/types/either'
import { WalletsRepository } from '../repositories/wallets-repository'
import { Category } from '@/domain/finances/enterprise/entities/category'
import { CategoriesRepository } from '../repositories/categories-repository'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

interface ListWalletCategoriesUseCaseRequest {
  memberId: string
}

type ListWalletCategoriesUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    categories: Category[]
  }
>

@Injectable()
export class ListWalletCategoriesUseCase {
  constructor(
    private walletsRepository: WalletsRepository,
    private categoriesRepository: CategoriesRepository,
  ) { }

  async execute({
    memberId,
  }: ListWalletCategoriesUseCaseRequest): Promise<ListWalletCategoriesUseCaseResponse> {
    const wallet = await this.walletsRepository.findByHolderId(memberId)

    if (!wallet) {
      return left(new ResourceNotFoundError())
    }

    const categories = await this.categoriesRepository.findManyByWalletId(
      wallet.id.toString(),
    )

    return right({
      categories,
    })
  }
}

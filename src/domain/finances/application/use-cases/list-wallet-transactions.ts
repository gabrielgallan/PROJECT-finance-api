import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { WalletsRepository } from '../repositories/wallets-repository'
import { TransactionsRepository } from '../repositories/transactions-repository'
import { CategoriesRepository } from '../repositories/categories-repository'
import { Category } from '@/domain/finances/enterprise/entities/category'
import { Pagination } from '@/core/types/repositories/pagination'
import { DateInterval } from '@/core/types/repositories/date-interval'
import { TransactionWithCategory } from '../../enterprise/entities/value-objects/transaction-with-category'
import { Injectable } from '@nestjs/common'

interface ListTransactionsFilters {
  categoryId?: string
  interval?: DateInterval
}

interface ListWalletTransactionsUseCaseRequest {
  memberId: string
  filters?: ListTransactionsFilters
  limit?: number
  page?: number
}

type ListWalletTransactionsUseCaseResponse = Either<
  | ResourceNotFoundError,
  {
    transactions: TransactionWithCategory[]
    interval: DateInterval
    pagination: Pagination
  }
>

@Injectable()
export class ListWalletTransactionsUseCase {
  constructor(
    private walletsRepository: WalletsRepository,
    private transactionsRepository: TransactionsRepository,
    private categoriesRepository: CategoriesRepository,
  ) { }

  async execute({
    memberId,
    filters,
    limit = 10,
    page = 1,
  }: ListWalletTransactionsUseCaseRequest): Promise<ListWalletTransactionsUseCaseResponse> {
    const now = new Date()
    const oneMonthAgo = new Date(now)

    oneMonthAgo.setMonth(now.getMonth() - 1)

    const interval: DateInterval = filters?.interval ??
    {
      startDate: oneMonthAgo,
      endDate: now
    }

    const pagination: Pagination = { limit, page }

    const wallet = await this.walletsRepository.findByHolderId(memberId)

    if (!wallet) {
      return left(new ResourceNotFoundError())
    }

    let category: Category | null = null

    if (filters?.categoryId) {
      category = await this.categoriesRepository.findByIdAndWalletId(
        filters.categoryId,
        wallet.id.toString()
      )

      if (!category) {
        return left(new ResourceNotFoundError())
      }
    }

    const transactions = await this.transactionsRepository.listPaginated({
      walletId: wallet.id.toString(),
      categoryId: category ? category.id.toString() : undefined,
      interval,
      pagination
    })

    const details = transactions.map(transaction => {
      return TransactionWithCategory.create({
        title: transaction.title,
        amount: transaction.amount,
        operation: transaction.operation,
        method: transaction.method,
        category: category ? {
          name: category.name,
          slug: category.slug.value
        } : null,
        createdAt: transaction.createdAt
      })
    })

    return right({
      transactions: details,
      interval,
      pagination,
    })
  }
}

import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { WalletsRepository } from '../repositories/wallets-repository'
import { TransactionsRepository } from '../repositories/transactions-repository'
import { CategoriesRepository } from '../repositories/categories-repository'
import { AnyCategoryFoundForWalletError } from './errors/any-category-found-for-wallet-error'
import { WalletSummary } from '../../enterprise/entities/value-objects/summaries/wallet-summary'
import { DateInterval } from '@/core/types/repositories/date-interval'
import { FinancialAnalyticsService } from '../services/financial-analytics/financial-analytics-service'
import { Injectable } from '@nestjs/common'

interface GetWalletSummariesByCategoriesUseCaseRequest {
  memberId: string
  interval: DateInterval
}

type GetWalletSummariesByCategoriesUseCaseResponse = Either<
  | ResourceNotFoundError
  | AnyCategoryFoundForWalletError,
  {
    fullTermAccounSummary: WalletSummary
    fromCategoriesSummaries: WalletSummary[]
  }
>

@Injectable()
export class GetWalletSummariesByCategoriesUseCase {
  constructor(
    private walletsRepository: WalletsRepository,
    private transactionsRepository: TransactionsRepository,
    private categoriesRepository: CategoriesRepository,
    private analyticsService: FinancialAnalyticsService,
  ) { }

  async execute({
    memberId,
    interval
  }: GetWalletSummariesByCategoriesUseCaseRequest): Promise<GetWalletSummariesByCategoriesUseCaseResponse> {
    const wallet = await this.walletsRepository.findByHolderId(memberId)

    if (!wallet) {
      return left(new ResourceNotFoundError())
    }

    const categories = await this.categoriesRepository.findManyByWalletId(
      wallet.id.toString(),
    )

    if (categories.length === 0) {
      return left(new AnyCategoryFoundForWalletError())
    }

    const transactions = await this.transactionsRepository.findManyByQuery({
      walletId: wallet.id.toString(),
      interval
    })

    const result = this.analyticsService.summarizeByCategories({
      walletId: wallet.id,
      categories,
      transactions,
      interval
    })

    return right({
      fullTermAccounSummary: result.totalSummary,
      fromCategoriesSummaries: result.partsSummaries,
    })
  }
}
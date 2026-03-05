import { GetWalletSummariesByCategoriesUseCase } from './get-wallet-summaries-by-categories'
import { InMemoryWalletsRepository } from 'test/unit/repositories/in-memory-wallets-repository'
import { makeWallet } from 'test/unit/factories/make-wallet'
import { InMemoryTransactionsRepository } from 'test/unit/repositories/in-memory-transactions-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryCategoriesRepository } from 'test/unit/repositories/in-memory-category-repository'
import { makeTransaction } from 'test/unit/factories/make-transaction'
import { TransactionOperation } from '@/domain/finances/enterprise/entities/transaction'
import { makeCategory } from 'test/unit/factories/make-category'
import { FinancialAnalyticsService } from '../services/analytics/financial-analytics-service'
import { Cash } from '../../enterprise/entities/value-objects/cash'

let walletsRepository: InMemoryWalletsRepository
let transactionsRepository: InMemoryTransactionsRepository
let categoriesRepository: InMemoryCategoriesRepository
let financialAnalyticsService: FinancialAnalyticsService

let sut: GetWalletSummariesByCategoriesUseCase

describe('Get wallet summaries by categories use case', () => {
  beforeEach(() => {
    walletsRepository = new InMemoryWalletsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()
    financialAnalyticsService = new FinancialAnalyticsService()

    sut = new GetWalletSummariesByCategoriesUseCase(
      walletsRepository,
      transactionsRepository,
      categoriesRepository,
      financialAnalyticsService
    )

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to get wallet summaries by categories', async () => {
    vi.setSystemTime(new Date(2025, 0, 13))

    const wallet = makeWallet(
      {
        holderId: new UniqueEntityID('member-1'),
      },
      new UniqueEntityID('wallet-1'),
    )

    await walletsRepository.create(wallet)

    await categoriesRepository.create(
      makeCategory(
        {
          walletId: new UniqueEntityID('wallet-1'),
          name: 'Freelance jobs',
        },
        new UniqueEntityID('category-1'),
      ),
    )

    await categoriesRepository.create(
      makeCategory(
        {
          walletId: new UniqueEntityID('wallet-1'),
          name: 'Sport expenses',
        },
        new UniqueEntityID('category-2'),
      ),
    )

    await Promise.all(
      Array.from({ length: 2 }, () =>
        transactionsRepository.create(
          makeTransaction({
            walletId: new UniqueEntityID('wallet-1'),
            categoryId: new UniqueEntityID('category-1'),
            amount: Cash.fromAmount(50),
            operation: TransactionOperation.INCOME,
          }),
        ),
      ),
    )

    await Promise.all(
      Array.from({ length: 3 }, () =>
        transactionsRepository.create(
          makeTransaction({
            walletId: new UniqueEntityID('wallet-1'),
            categoryId: new UniqueEntityID('category-2'),
            amount: Cash.fromAmount(25),
            operation: TransactionOperation.EXPENSE,
          }),
        ),
      ),
    )

    const result = await sut.execute({
      memberId: 'member-1',
      interval: {
        startDate: new Date(2025, 0, 12),
        endDate: new Date(2025, 0, 14),
      }
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.fromCategoriesSummaries).toHaveLength(2)
      expect(result.value.fromCategoriesSummaries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            categoryId: new UniqueEntityID('category-1'),
            totals: {
              income: 100,
              expense: 0
            },
            netBalance: 100
          }),
          expect.objectContaining({
            categoryId: new UniqueEntityID('category-2'),
            totals: {
              income: 0,
              expense: 75
            },
            netBalance: -75
          })
        ])
      )
    }
  })
})

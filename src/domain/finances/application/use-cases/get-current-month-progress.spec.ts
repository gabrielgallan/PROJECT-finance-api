import { makeWallet } from 'test/unit/factories/make-wallet'
import { InMemoryWalletsRepository } from 'test/unit/repositories/in-memory-wallets-repository'
import { InMemoryTransactionsRepository } from 'test/unit/repositories/in-memory-transactions-repository'
import { TransactionsRepository } from '../repositories/transactions-repository'
import { makeTransaction } from 'test/unit/factories/make-transaction'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { TransactionOperation } from '../../enterprise/entities/transaction'
import { Cash } from '../../enterprise/entities/value-objects/cash'
import { GetGetCurrentMonthProgressUseCase } from './get-current-month-progress'
import { InMemoryCategoriesRepository } from 'test/unit/repositories/in-memory-category-repository'

let walletsRepository: InMemoryWalletsRepository
let transactionsRepository: TransactionsRepository

let sut: GetGetCurrentMonthProgressUseCase

describe('Get current month progress use case', () => {
  beforeEach(() => {
    walletsRepository = new InMemoryWalletsRepository()
    transactionsRepository = new InMemoryTransactionsRepository(
      new InMemoryCategoriesRepository()
    )

    sut = new GetGetCurrentMonthProgressUseCase(
      walletsRepository,
      transactionsRepository,
    )

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to get the current month progress', async () => {
    vi.setSystemTime(new Date(2025, 0, 1))

    await walletsRepository.create(
      makeWallet(
        {
          holderId: new UniqueEntityID('member-1'),
        },
        new UniqueEntityID('wallet-1'),
      ),
    )

    await transactionsRepository.create(
      makeTransaction({
        walletId: new UniqueEntityID('wallet-1'),
        createdAt: new Date(2025, 0, 5),
      }),
    )

    await transactionsRepository.create(
      makeTransaction({
        amount: Cash.fromAmount(179.9),
        walletId: new UniqueEntityID('wallet-1'),
        operation: TransactionOperation.INCOME,
        createdAt: new Date(2025, 0, 13),
      }),
    )

    await transactionsRepository.create(
      makeTransaction({
        walletId: new UniqueEntityID('wallet-1'),
        createdAt: new Date(2025, 0, 21),
      }),
    )

    await transactionsRepository.create(
      makeTransaction({
        walletId: new UniqueEntityID('wallet-1'),
        createdAt: new Date(2025, 0, 25),
      }),
    )

    vi.setSystemTime(new Date(2025, 0, 30))

    const result = await sut.execute({
      memberId: 'member-1',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.progress.weeks).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            week: 2,
            summary: expect.objectContaining({
              totals: {
                income: 179.9,
                expense: expect.any(Number)
              },
            }),
          }),
        ])
      )
    }
  })
})

import { makeWallet } from 'test/unit/factories/make-wallet'
import { InMemoryWalletsRepository } from 'test/unit/repositories/in-memory-wallets-repository'
import { GetRollingYearProgressUseCase } from './get-rolling-yearly-progress'
import { InMemoryTransactionsRepository } from 'test/unit/repositories/in-memory-transactions-repository'
import { TransactionsRepository } from '../repositories/transactions-repository'
import { makeTransaction } from 'test/unit/factories/make-transaction'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { TransactionOperation } from '../../enterprise/entities/transaction'

let walletsRepository: InMemoryWalletsRepository
let transactionsRepository: TransactionsRepository

let sut: GetRollingYearProgressUseCase

describe('Get rolling yearly progress use case', () => {
  beforeEach(() => {
    walletsRepository = new InMemoryWalletsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()

    sut = new GetRollingYearProgressUseCase(
      walletsRepository,
      transactionsRepository,
    )

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to get a rolling year summary categorized by months', async () => {
    vi.setSystemTime(new Date(2025, 6, 10))

    await walletsRepository.create(
      makeWallet(
        {
          holderId: new UniqueEntityID('member-1'),
        },
        new UniqueEntityID('Wallet-1'),
      ),
    )

    await transactionsRepository.create(
      makeTransaction({
        walletId: new UniqueEntityID('Wallet-1'),
        createdAt: new Date(2025, 6, 23),
      }),
    )

    await transactionsRepository.create(
      makeTransaction({
        amount: 179.9,
        walletId: new UniqueEntityID('Wallet-1'),
        operation: TransactionOperation.INCOME,
        createdAt: new Date(2025, 9, 25),
      }),
    )

    await transactionsRepository.create(
      makeTransaction({
        walletId: new UniqueEntityID('Wallet-1'),
        createdAt: new Date(2026, 0, 30),
      }),
    )

    vi.setSystemTime(new Date(2026, 0, 31))

    const result = await sut.execute({
      memberId: 'member-1',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.yearWalletSummary.monthSummaries).toHaveLength(12)
      expect(result.value.yearWalletSummary.monthSummaries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            monthIndex: 10,
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

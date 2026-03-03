import { GetWalletSummaryUseCase } from './get-wallet-summary'
import { InMemoryWalletsRepository } from 'test/unit/repositories/in-memory-wallets-repository'
import { makeWallet } from 'test/unit/factories/make-wallet'
import { InMemoryTransactionsRepository } from 'test/unit/repositories/in-memory-transactions-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeTransaction } from 'test/unit/factories/make-transaction'
import { TransactionOperation } from '@/domain/finances/enterprise/entities/transaction'

let walletsRepository: InMemoryWalletsRepository
let transactionsRepository: InMemoryTransactionsRepository

let sut: GetWalletSummaryUseCase

describe('Get wallet summary by interval use case', () => {
  beforeEach(() => {
    walletsRepository = new InMemoryWalletsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()

    sut = new GetWalletSummaryUseCase(
      walletsRepository,
      transactionsRepository,
    )

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to get wallet summary by time interval', async () => {
    vi.setSystemTime(new Date(2025, 0, 13))

    const wallet = makeWallet(
      {
        holderId: new UniqueEntityID('member-1'),
        balance: 250,
      },
      new UniqueEntityID('wallet-1'),
    )

    await walletsRepository.create(wallet)

    await transactionsRepository.create(
      makeTransaction({
        walletId: new UniqueEntityID('wallet-1'),
        amount: 45,
        operation: TransactionOperation.EXPENSE,
      }),
    )

    wallet.withdraw(45)

    await walletsRepository.save(wallet)

    const result = await sut.execute({
      memberId: 'member-1',
      interval: {
        startDate: new Date(2025, 0, 12),
        endDate: new Date(2025, 0, 14),
      }
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.summary.netBalance).toBe(-45)
      expect(result.value.summary.totals.expense).toBe(45)
      expect(result.value.summary.totals.income).toBe(0)
      expect(result.value.summary.counts.transactions).toBe(1)
    }
  })
})

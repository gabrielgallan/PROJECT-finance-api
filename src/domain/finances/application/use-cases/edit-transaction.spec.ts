import { InMemoryWalletsRepository } from 'test/unit/repositories/in-memory-wallets-repository'
import { InMemoryTransactionsRepository } from 'test/unit/repositories/in-memory-transactions-repository'
import { makeWallet } from 'test/unit/factories/make-wallet'
import { InMemoryCategoriesRepository } from 'test/unit/repositories/in-memory-category-repository'
import { makeCategory } from 'test/unit/factories/make-category'
import { EditTransactionUseCase } from './edit-transaction'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeTransaction } from 'test/unit/factories/make-transaction'

let walletsRepository: InMemoryWalletsRepository
let transactionsRepository: InMemoryTransactionsRepository
let categoriesRepository: InMemoryCategoriesRepository

let sut: EditTransactionUseCase

describe('Edit transaction use case', () => {
  beforeEach(() => {
    walletsRepository = new InMemoryWalletsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new EditTransactionUseCase(
      walletsRepository,
      transactionsRepository,
      categoriesRepository,
    )
  })

  it('should be able to edit a transaction', async () => {
    await walletsRepository.create(
      makeWallet(
        {
          holderId: new UniqueEntityID('member-1'),
        },
        new UniqueEntityID('wallet-1'),
      ),
    )

    await categoriesRepository.create(
      makeCategory(
        {
          walletId: new UniqueEntityID('wallet-1'),
          name: 'Monthly Bills',
        },
        new UniqueEntityID('category-2'),
      ),
    )

    await transactionsRepository.create(
      makeTransaction(
        {
          walletId: new UniqueEntityID('wallet-1'),
          title: 'Netflix',
          amount: 39.99,
        },
        new UniqueEntityID('transaction-1'),
      ),
    )

    expect(transactionsRepository.items[0].title).toBe('Netflix')

    const result = await sut.execute({
      memberId: 'member-1',
      transactionId: 'transaction-1',
      categoryId: 'category-2',
      title: 'Netflix Sign',
      method: 'credit',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.transaction.title).toBe('Netflix Sign')
      expect(result.value.transaction.method).toBe('credit')
      expect(result.value.transaction.categoryId?.toString()).toBe('category-2')
    }
  })
})

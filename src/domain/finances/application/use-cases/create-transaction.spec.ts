import { CreateTransactionUseCase } from './create-transaction'
import { InMemoryWalletsRepository } from 'test/unit/repositories/in-memory-wallets-repository'
import { InMemoryTransactionsRepository } from 'test/unit/repositories/in-memory-transactions-repository'
import { makeWallet } from 'test/unit/factories/make-wallet'
import { InMemoryCategoriesRepository } from 'test/unit/repositories/in-memory-category-repository'
import { makeCategory } from 'test/unit/factories/make-category'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { InvalidPositiveNumberError } from '@/core/errors/invalid-positive-number-error'

let walletsRepository: InMemoryWalletsRepository
let transactionsRepository: InMemoryTransactionsRepository
let categoriesRepository: InMemoryCategoriesRepository

let sut: CreateTransactionUseCase

describe('Create transaction use case', () => {
  beforeEach(() => {
    walletsRepository = new InMemoryWalletsRepository()
    transactionsRepository = new InMemoryTransactionsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new CreateTransactionUseCase(
      walletsRepository,
      transactionsRepository,
      categoriesRepository,
    )
  })

  it('should be able to create transactions', async () => {
    await walletsRepository.create(
      makeWallet({
        holderId: new UniqueEntityID('member-1'),
        balance: 0,
      }, new UniqueEntityID('member-1'))
    )

    const incomeResult = await sut.execute({
      memberId: 'member-1',
      title: 'Month Salary',
      amount: 2000,
      operation: 'income',
    })

    expect(walletsRepository.items[0].balance).toBe(2000)

    const expenseResult = await sut.execute({
      memberId: 'member-1',
      title: 'Pay Wallet Debt',
      amount: 450.55,
      operation: 'expense',
    })

    expect(incomeResult.isRight()).toBe(true)
    expect(expenseResult.isRight()).toBe(true)

    if (incomeResult.isRight() && expenseResult.isRight()) {
      expect(incomeResult.value.transaction.isIncome()).toBe(true)
      expect(expenseResult.value.transaction.isExpense()).toBe(true)

      expect(incomeResult.value.transaction.amount).toBe(2000)
      expect(expenseResult.value.transaction.amount).toBe(450.55)

      expect(walletsRepository.items[0].balance).toBe(1549.45)
    }
  })

  it('should be able to create transactions from a category', async () => {
    await walletsRepository.create(
      makeWallet({
        holderId: new UniqueEntityID('member-1'),
        balance: 100,
      },
        new UniqueEntityID('wallet-1'),
      )
    )

    await categoriesRepository.create(
      makeCategory(
        {
          walletId: new UniqueEntityID('wallet-1'),
          name: 'Transport',
        },
        new UniqueEntityID('category-1'),
      ),
    )

    const result = await sut.execute({
      memberId: 'member-1',
      categoryId: 'category-1',
      title: 'Uber',
      amount: 25.9,
      operation: 'expense',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.transaction.isExpense()).toBe(true)
      expect(result.value.transaction.amount).toBe(25.9)
      expect(walletsRepository.items[0].balance).toBe(74.1)
      expect(result.value.transaction.categoryId?.toString()).toBe('category-1')
    }
  })

  it('should not be able to create transactions from a category of another wallet', async () => {
    await walletsRepository.create(
      makeWallet(
        {
          holderId: new UniqueEntityID('member-1'),
        },
        new UniqueEntityID('wallet-1'),
      ),
    )

    await categoriesRepository.create(
      makeCategory({
        walletId: new UniqueEntityID('another-wallet-id')
      }, new UniqueEntityID('category-1')),
    )

    const result = await sut.execute({
      memberId: 'member-1',
      categoryId: 'category-1',
      title: 'Uber',
      amount: 25.9,
      operation: 'expense',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to create a transaction with negative amount', async () => {
    const result = await sut.execute({
      memberId: 'member-1',
      categoryId: 'category-1',
      title: 'Uber',
      amount: -25.9,
      operation: 'expense',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidPositiveNumberError)
  })
})

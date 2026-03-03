import { makeWallet } from 'test/unit/factories/make-wallet'
import { InMemoryWalletsRepository } from 'test/unit/repositories/in-memory-wallets-repository'
import { InMemoryCategoriesRepository } from 'test/unit/repositories/in-memory-category-repository'
import { CreateWalletCategoryUseCase } from './create-wallet-category'
import { CategoryAlreadyExistsError } from './errors/category-already-exists-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let walletsRepository: InMemoryWalletsRepository
let categoriesRepository: InMemoryCategoriesRepository

let sut: CreateWalletCategoryUseCase

describe('Create category use case', () => {
  beforeEach(() => {
    walletsRepository = new InMemoryWalletsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new CreateWalletCategoryUseCase(
      walletsRepository,
      categoriesRepository,
    )
  })

  it('should be able to create a category', async () => {
    await walletsRepository.create(
      makeWallet(
        {
          holderId: new UniqueEntityID('member-1'),
        },
        new UniqueEntityID('wallet-1'),
      ),
    )

    const result = await sut.execute({
      memberId: 'member-1',
      categoryName: 'Expenses from School',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.category.slug.value).toBe('expenses-from-school')
    }
  })

  it('should not be able to create two category with same slug to one wallet', async () => {
    await walletsRepository.create(
      makeWallet(
        {
          holderId: new UniqueEntityID('member-1'),
        },
        new UniqueEntityID('wallet-1'),
      ),
    )

    await sut.execute({
      memberId: 'member-1',
      categoryName: 'Sport expenses',
    })

    const result = await sut.execute({
      memberId: 'member-1',
      categoryName: 'Sport expenses',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(CategoryAlreadyExistsError)
  })

  it('should be able to create two category with different slug to one wallet', async () => {
    await walletsRepository.create(
      makeWallet(
        {
          holderId: new UniqueEntityID('member-1'),
        },
        new UniqueEntityID('wallet-1'),
      ),
    )

    const result1 = await sut.execute({
      memberId: 'member-1',
      categoryName: 'Sport expenses',
    })

    const result2 = await sut.execute({
      memberId: 'member-1',
      categoryName: 'Expenses from School',
    })

    expect(result1.isRight()).toBe(true)
    expect(result2.isRight()).toBe(true)

    if (result1.isRight() && result2.isRight()) {
      expect(result1.value.category.slug.value).toBe('sport-expenses')
      expect(result2.value.category.slug.value).toBe('expenses-from-school')

      expect(result1.value.category.walletId.toString()).toBe('wallet-1')
      expect(result2.value.category.walletId.toString()).toBe('wallet-1')
    }
  })
})

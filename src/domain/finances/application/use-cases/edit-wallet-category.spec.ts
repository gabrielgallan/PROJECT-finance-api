import { makeWallet } from 'test/unit/factories/make-wallet'
import { InMemoryWalletsRepository } from 'test/unit/repositories/in-memory-wallets-repository'
import { InMemoryCategoriesRepository } from 'test/unit/repositories/in-memory-category-repository'
import { EditWalletCategoryUseCase } from './edit-wallet-category'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeCategory } from 'test/unit/factories/make-category'

let walletsRepository: InMemoryWalletsRepository
let categoriesRepository: InMemoryCategoriesRepository

let sut: EditWalletCategoryUseCase

describe('Edit wallet category use case', () => {
  beforeEach(() => {
    walletsRepository = new InMemoryWalletsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new EditWalletCategoryUseCase(
      walletsRepository,
      categoriesRepository,
    )
  })

  it('should be able to edit wallet category', async () => {
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
          name: 'Sports Expenses',
        },
        new UniqueEntityID('category-1'),
      ),
    )

    expect(categoriesRepository.items[0].slug.value).toBe('sports-expenses')

    const result = await sut.execute({
      memberId: 'member-1',
      slug: 'sports-expenses',
      name: 'Food Expenses',
      description: 'my food expenses'
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.category.slug.value).toBe('food-expenses')
      expect(result.value.category.description).toBe('my food expenses')
    }
  })
})

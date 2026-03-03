import { makeWallet } from 'test/unit/factories/make-wallet'
import { InMemoryWalletsRepository } from 'test/unit/repositories/in-memory-wallets-repository'
import { InMemoryCategoriesRepository } from 'test/unit/repositories/in-memory-category-repository'
import { ListWalletCategoriesUseCase } from './list-wallet-categories'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeCategory } from 'test/unit/factories/make-category'
import { Slug } from '@/domain/finances/enterprise/entities/value-objects/slug'

let walletsRepository: InMemoryWalletsRepository
let categoriesRepository: InMemoryCategoriesRepository

let sut: ListWalletCategoriesUseCase

describe('List wallet categories use case', () => {
  beforeEach(() => {
    walletsRepository = new InMemoryWalletsRepository()
    categoriesRepository = new InMemoryCategoriesRepository()

    sut = new ListWalletCategoriesUseCase(
      walletsRepository,
      categoriesRepository,
    )
  })

  it('should be able to list wallet categories', async () => {
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
        walletId: new UniqueEntityID('wallet-1'),
        name: 'Sports Expenses',
      }),
    )

    const result = await sut.execute({
      memberId: 'member-1',
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.categories).toEqual([
        expect.objectContaining({
          name: 'Sports Expenses',
          slug: new Slug('sports-expenses'),
        }),
      ])
    }
  })
})

import { InMemoryWalletsRepository } from 'test/unit/repositories/in-memory-wallets-repository'
import { makeWallet } from 'test/unit/factories/make-wallet'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { GetWalletInfoUseCase } from './get-wallet-info'

let walletsRepository: InMemoryWalletsRepository

let sut: GetWalletInfoUseCase

describe('Get wallet info use case', () => {
    beforeEach(() => {
        walletsRepository = new InMemoryWalletsRepository()

        sut = new GetWalletInfoUseCase(
            walletsRepository
        )
    })

    it('should be able to get wallet info', async () => {
        await walletsRepository.create(
            makeWallet({
                holderId: new UniqueEntityID('member-1'),
                balance: 100
            },
                new UniqueEntityID('wallet-1')
            )
        )

        const result = await sut.execute({
            memberId: 'member-1'
        })

        expect(result.isRight()).toBe(true)
        expect(result.value).toMatchObject({
            balance: 100,
            createdAt: expect.any(Date),
            updatedAt: null
        })
    })
})

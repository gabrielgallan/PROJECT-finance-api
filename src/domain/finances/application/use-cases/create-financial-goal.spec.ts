import { InMemoryWalletsRepository } from 'test/unit/repositories/in-memory-wallets-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeWallet } from 'test/unit/factories/make-wallet'
import { CreateFinancialGoalUseCase } from './create-financial-goal'
import { InMemoryFinancialGoalsRepository } from 'test/unit/repositories/in-memory-financial-goals-repository'

let walletRepository: InMemoryWalletsRepository
let financialGoalsRepository: InMemoryFinancialGoalsRepository

let sut: CreateFinancialGoalUseCase

describe.skip('Create financial goal use case', () => {
    beforeEach(() => {
        walletRepository = new InMemoryWalletsRepository()
        financialGoalsRepository = new InMemoryFinancialGoalsRepository()

        sut = new CreateFinancialGoalUseCase(
            walletRepository,
            financialGoalsRepository
        )

        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should be able to create a wallet financial goal', async () => {
        vi.setSystemTime(new Date(2026, 1, 9))

        await walletRepository.create(
            makeWallet({
                holderId: new UniqueEntityID('member-1')
            }, new UniqueEntityID('wallet-1'))
        )

        const result = await sut.execute({
            memberId: 'member-1',
            title: 'Mercedes Benz',
            description: 'Budget to buy mercedes benz',
            targetAmount: 130000,
            targetDate: new Date(2027, 0, 31)
        })

        expect(result.isRight()).toBe(true)

        if (result.isRight()) {
            expect(result.value.financialGoal.walletId.toString()).toBe('wallet-1')
            expect(result.value.financialGoal.targetAmount).toBe(130000)
            expect(result.value.financialGoal.targetDate).toEqual(new Date(2027, 0, 31))
        }
    })
})

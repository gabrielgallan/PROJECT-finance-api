import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { WalletsRepository } from '../repositories/wallets-repository'
import { FinancialGoal } from '../../enterprise/entities/financial-goal'
import { FinancialGoalsRepository } from '../repositories/financial-goals-repository'
import dayjs from 'dayjs'
import { InvalidPeriodError } from './errors/invalid-period-error'
import { InvalidPositiveNumberError } from '@/core/errors/invalid-positive-number-error'

interface CreateFinancialGoalUseCaseRequest {
  memberId: string
  title: string
  description?: string
  targetAmount: number
  targetDate: Date
}

type CreateFinancialGoalUseCaseResponse = Either<
  | ResourceNotFoundError
  | InvalidPeriodError
  | InvalidPositiveNumberError,
  {
    financialGoal: FinancialGoal
  }
>

export class CreateFinancialGoalUseCase {
  constructor(
    private walletsRepository: WalletsRepository,
    private financialGoalsRepository: FinancialGoalsRepository
  ) { }

  async execute({
    memberId,
    title,
    description,
    targetAmount,
    targetDate
  }: CreateFinancialGoalUseCaseRequest): Promise<CreateFinancialGoalUseCaseResponse> {
    const targetDateJS = dayjs(targetDate)

    if (targetDateJS.isBefore(dayjs())) {
      return left(new InvalidPeriodError())
    }

    if (targetAmount <= 0) {
      return left(new InvalidPositiveNumberError())
    }

    const wallet = await this.walletsRepository.findByHolderId(memberId)

    if (!wallet) {
      return left(new ResourceNotFoundError())
    }

    const financialGoal = FinancialGoal.create({
      walletId: wallet.id,
      title,
      description,
      targetAmount,
      targetDate
    })

    await this.financialGoalsRepository.create(financialGoal)

    return right({
      financialGoal,
    })
  }
}

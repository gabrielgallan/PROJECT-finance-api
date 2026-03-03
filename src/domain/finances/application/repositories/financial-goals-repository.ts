import { FinancialGoal } from '../../enterprise/entities/financial-goal'

export abstract class FinancialGoalsRepository {
  abstract create(financialGoal: FinancialGoal): Promise<void>
}
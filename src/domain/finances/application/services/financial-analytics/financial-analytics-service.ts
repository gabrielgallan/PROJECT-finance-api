import { WalletSummaryCalculator } from "./wallet-summary-calculator";
import { DateInterval } from "@/core/types/repositories/date-interval";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Category } from "../../../enterprise/entities/category";
import { Transaction } from "../../../enterprise/entities/transaction";
import { WalletSummary } from "../../../enterprise/entities/value-objects/summaries/wallet-summary";
import { WalletSummaryComparator } from "./wallet-summary-comparator";

interface SummarizeByCategoriesInput {
  walletId: UniqueEntityID
  categories: Category[]
  transactions: Transaction[]
  interval: DateInterval
}

export class FinancialAnalyticsService {
  summarizeByCategories({
    walletId,
    categories,
    transactions,
    interval
  }: SummarizeByCategoriesInput) {
    const totalSummary = WalletSummaryCalculator.calculate({
      walletId,
      interval,
      transactions
    })

    const partsSummaries: WalletSummary[] = []

    for (const category of categories) {
      const transactionsByCategory = transactions.filter(t => t.categoryId?.toString() === category.id.toString())

      const categorySummary = WalletSummaryCalculator.calculate({
        walletId,
        categoryId: category.id,
        interval,
        transactions: transactionsByCategory
      })

      const percentages = WalletSummaryComparator.compare({
        totalSummary,
        partSummary: categorySummary
      })

      categorySummary.percentages = percentages

      partsSummaries.push(categorySummary)
    }

    return {
      totalSummary,
      partsSummaries
    }
  }
}
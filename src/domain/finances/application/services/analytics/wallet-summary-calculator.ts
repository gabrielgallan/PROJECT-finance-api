import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { WalletSummary } from "@/domain/finances/enterprise/entities/value-objects/wallet-summary";
import { Transaction } from "@/domain/finances/enterprise/entities/transaction";
import { DateInterval } from "@/core/types/repositories/date-interval";
import { calculateTransactionsTotals } from "../../utils/calculate-transactions-totals";

export interface WalletSummaryCalculatorInput {
    walletId: UniqueEntityID
    categoryId?: UniqueEntityID
    interval: DateInterval
    transactions: Transaction[]
}

export class WalletSummaryCalculator {
    static calculate(input: WalletSummaryCalculatorInput): WalletSummary {
        const {
            totalIncome,
            totalExpense,
        } = calculateTransactionsTotals({ transactions: input.transactions })

        return WalletSummary.generate({
            walletId: input.walletId,
            categoryId: input.categoryId,
            interval: input.interval,
            totals: {
                income: totalIncome,
                expense: totalExpense
            },
            counts: {
                transactions: input.transactions.length
            },
            netBalance: totalIncome - totalExpense
        })
    }
}
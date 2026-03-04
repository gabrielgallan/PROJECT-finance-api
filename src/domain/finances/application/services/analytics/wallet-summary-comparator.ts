import { WalletSummary, ComparativePercentages } from "../../../enterprise/entities/value-objects/wallet-summary";
import { calculatePartPercentage } from "../../utils/calculate-percentage";

export interface WalletSummaryComparatorInput {
    totalSummary: WalletSummary
    partSummary: WalletSummary
}

export class WalletSummaryComparator {
    static compare({ totalSummary, partSummary }: WalletSummaryComparatorInput): ComparativePercentages {
        const percentages = {
            income: calculatePartPercentage({
                totalValue: totalSummary.totals.income,
                partValue: partSummary.totals.income
            }),

            expense: calculatePartPercentage({
                totalValue: totalSummary.totals.expense,
                partValue: partSummary.totals.expense
            })
        }

        return percentages
    }
}
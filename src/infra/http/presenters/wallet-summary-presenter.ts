import { WalletSummary } from "@/domain/finances/enterprise/entities/value-objects/wallet-summary"

export interface WalletSummaryPresenterToHTTP {
    categoryId: string | null
    interval: {
        startDate: Date
        endDate: Date
    }
    totals: {
        income: number
        expense: number
    }
    netBalance: number
    counts: {
        transactions: number
    }
    percentages: {
        income: number
        expense: number
    } | null
}

export class WalletSummaryPresenter {
    static toHTTP(summary: WalletSummary): WalletSummaryPresenterToHTTP {
        return {
            categoryId: summary.categoryId?.toString() ?? null,
            interval: summary.interval,
            totals: summary.totals,
            netBalance: summary.netBalance,
            counts: summary.counts,
            percentages: summary.percentages ?? null,
        }
    }
}
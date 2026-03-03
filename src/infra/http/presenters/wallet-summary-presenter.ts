import { WalletSummary } from "@/domain/finances/enterprise/entities/value-objects/summaries/wallet-summary"

export class WalletSummaryPresenter {
    static toHTTP(summary: WalletSummary) {
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
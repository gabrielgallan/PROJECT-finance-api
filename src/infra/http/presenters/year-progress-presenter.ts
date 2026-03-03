import { YearWalletSummary } from "@/domain/finances/enterprise/entities/value-objects/summaries/year-account-summary"

export class YearProgressPresenter {
    static toHTTP(summary: YearWalletSummary) {
        return {
            year: {
                interval: summary.yearSummary.interval,
                totals: summary.yearSummary.totals,
                netBalance: summary.yearSummary.netBalance,
                counts: summary.yearSummary.counts,
            },
            months: summary.monthSummaries.map(m => {
                return {
                    monthIndex: m.monthIndex,
                    summary: {
                        totals: m.summary.totals,
                        netBalance: m.summary.netBalance,
                        counts: m.summary.counts,
                        percentages: m.summary.percentages
                    }
                }
            })
        }
    }
}
import { YearProgress } from "@/domain/finances/application/use-cases/get-rolling-yearly-progress"

export class YearProgressPresenter {
    static toHTTP(progress: YearProgress) {
        return {
            year: {
                interval: progress.yearSummary.interval,
                totals: progress.yearSummary.totals,
                netBalance: progress.yearSummary.netBalance,
                counts: progress.yearSummary.counts,
            },
            months: progress.months.map(m => {
                return {
                    year: m.year,
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
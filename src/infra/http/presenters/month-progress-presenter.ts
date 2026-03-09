import { MonthProgress } from "@/domain/finances/application/use-cases/get-current-month-progress"

export class MonthProgressPresenter {
    static toHTTP(progress: MonthProgress) {
        return {
            month: {
                interval: progress.monthSummary.interval,
                totals: progress.monthSummary.totals,
                netBalance: progress.monthSummary.netBalance,
                counts: progress.monthSummary.counts.transactions,
            },
            weeks: progress.weeks.map(w => {
                return {
                    week: w.week,
                    summary: {
                        interval: w.summary.interval,
                        totals: w.summary.totals,
                        netBalance: w.summary.netBalance,
                        counts: w.summary.counts,
                        percentages: w.summary.percentages
                    }
                }
            })
        }
    }
}
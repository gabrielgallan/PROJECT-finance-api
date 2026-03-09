import { Either, left, right } from '@/core/types/either'
import { WalletsRepository } from '../repositories/wallets-repository'
import { TransactionsRepository } from '../repositories/transactions-repository'
import { WalletSummaryCalculator } from '../services/analytics/wallet-summary-calculator'
import { WalletSummaryComparator } from '../services/analytics/wallet-summary-comparator'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { DateRangeConstructor } from '../services/dates/date-range-constructor'
import { WalletSummary } from '../../enterprise/entities/value-objects/wallet-summary'

export interface MonthProgress {
    monthSummary: WalletSummary
    weeks: {
        week: number,
        summary: WalletSummary
    }[]
}

interface GetGetCurrentMonthProgressUseCaseRequest {
    memberId: string
}

type GetGetCurrentMonthProgressUseCaseResponse = Either<
    ResourceNotFoundError,
    {
        progress: MonthProgress
    }
>

@Injectable()
export class GetGetCurrentMonthProgressUseCase {
    constructor(
        private walletsRepository: WalletsRepository,
        private transactionsRepository: TransactionsRepository,
    ) { }

    async execute({
        memberId,
    }: GetGetCurrentMonthProgressUseCaseRequest): Promise<GetGetCurrentMonthProgressUseCaseResponse> {
        const wallet = await this.walletsRepository.findByHolderId(memberId)

        if (!wallet) {
            return left(new ResourceNotFoundError())
        }

        const { weeks } = DateRangeConstructor.getCurrentMonthWeeks()

        const monthInterval = {
            startDate: weeks[0].interval.startDate,
            endDate: weeks[weeks.length - 1].interval.endDate
        }

        const monthTransactions = await this.transactionsRepository.findManyByQuery({
            walletId: wallet.id.toString(),
            interval: monthInterval,
        })

        const monthSummary = WalletSummaryCalculator.calculate({
            walletId: wallet.id,
            interval: monthInterval,
            transactions: monthTransactions
        })

        const weeksSummaries: {
            week: number,
            summary: WalletSummary
        }[] = []

        for (const week of weeks) {
            const { interval } = week

            const transactionsByWeek =
                await this.transactionsRepository.findManyByQuery({
                    walletId: wallet.id.toString(),
                    interval,
                })

            const weekSummary = WalletSummaryCalculator.calculate({
                walletId: wallet.id,
                interval,
                transactions: transactionsByWeek
            })

            const percentages = WalletSummaryComparator.compare({
                totalSummary: monthSummary,
                partSummary: weekSummary
            })

            weekSummary.percentages = percentages

            weeksSummaries.push({
                week: week.week,
                summary: weekSummary
            })
        }

        const progress = {
            monthSummary,
            weeks: weeksSummaries
        }

        return right({
            progress
        })
    }
}
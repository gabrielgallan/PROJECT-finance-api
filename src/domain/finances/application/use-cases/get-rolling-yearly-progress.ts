import { Either, left, right } from '@/core/types/either'
import { WalletsRepository } from '../repositories/wallets-repository'
import { TransactionsRepository } from '../repositories/transactions-repository'
import { WalletSummaryCalculator } from '../services/analytics/wallet-summary-calculator'
import { WalletSummaryComparator } from '../services/analytics/wallet-summary-comparator'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { DateRangeConstructor } from '../services/dates/date-range-constructor'
import { WalletSummary } from '../../enterprise/entities/value-objects/wallet-summary'

export interface YearProgress {
    yearSummary: WalletSummary,
    months: {
        year: number
        monthIndex: number,
        summary: WalletSummary
    }[]
}

interface GetRollingYearProgressUseCaseRequest {
    memberId: string
}

type GetRollingYearProgressUseCaseResponse = Either<
    ResourceNotFoundError,
    {
        progress: YearProgress
    }
>

@Injectable()
export class GetRollingYearProgressUseCase {
    constructor(
        private walletsRepository: WalletsRepository,
        private transactionsRepository: TransactionsRepository,
    ) { }

    async execute({
        memberId,
    }: GetRollingYearProgressUseCaseRequest): Promise<GetRollingYearProgressUseCaseResponse> {
        const wallet = await this.walletsRepository.findByHolderId(memberId)

        if (!wallet) {
            return left(new ResourceNotFoundError())
        }

        const { months } = DateRangeConstructor.getLastTwelveMonths()

        const yearInterval = {
            startDate: months[0].interval.startDate,
            endDate: months[months.length - 1].interval.endDate
        }

        const yearTransactions = await this.transactionsRepository.findManyByQuery({
            walletId: wallet.id.toString(),
            interval: yearInterval,
        })

        const yearSummary = WalletSummaryCalculator.calculate({
            walletId: wallet.id,
            interval: yearInterval,
            transactions: yearTransactions
        })

        const monthsSummaries: {
            year: number,
            monthIndex: number,
            summary: WalletSummary
        }[] = []

        for (const month of months) {
            const { interval } = month

            const transactionsByMonth =
                await this.transactionsRepository.findManyByQuery({
                    walletId: wallet.id.toString(),
                    interval,
                })

            const monthSummary = WalletSummaryCalculator.calculate({
                walletId: wallet.id,
                interval,
                transactions: transactionsByMonth
            })

            const percentages = WalletSummaryComparator.compare({
                totalSummary: yearSummary,
                partSummary: monthSummary
            })

            monthSummary.percentages = percentages

            monthsSummaries.push({
                year: month.year,
                monthIndex: month.month,
                summary: monthSummary
            })
        }

        const progress = {
            yearSummary,
            months: monthsSummaries
        }

        return right({
            progress
        })
    }
}
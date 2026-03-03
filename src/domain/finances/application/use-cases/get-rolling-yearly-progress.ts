import { Either, left, right } from '@/core/types/either'
import { WalletsRepository } from '../repositories/wallets-repository'
import { TransactionsRepository } from '../repositories/transactions-repository'
import dayjs from 'dayjs'

import { getMonthDateRange } from '../utils/get-month-date-range'
import { YearWalletSummary, MonthSummaryProps } from '../../enterprise/entities/value-objects/summaries/year-account-summary'
import { WalletSummaryCalculator } from '../services/financial-analytics/wallet-summary-calculator'
import { WalletSummaryComparator } from '../services/financial-analytics/wallet-summary-comparator'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

interface GetRollingYearProgressUseCaseRequest {
    memberId: string
}

type GetRollingYearProgressUseCaseResponse = Either<
    ResourceNotFoundError,
    {
        yearWalletSummary: YearWalletSummary
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

        const rollingYearEndDate = new Date()
        const rollingYearStartDate = new Date()

        rollingYearStartDate.setFullYear(rollingYearEndDate.getFullYear() - 1)

        const yearInterval = {
            startDate: rollingYearStartDate,
            endDate: rollingYearEndDate
        }

        const rollingYearTransactions = await this.transactionsRepository.findManyByQuery({
            walletId: wallet.id.toString(),
            interval: yearInterval,
        })

        const rollingYearSummary = WalletSummaryCalculator.calculate({
            walletId: wallet.id,
            interval: yearInterval,
            transactions: rollingYearTransactions
        })

        const rollingMonthsSummaries: MonthSummaryProps[] = []

        for (let c = 11; c >= 0; c--) {
            const referenceDate = dayjs().subtract(c, 'month')

            const { interval } = getMonthDateRange({
                date: referenceDate.toDate()
            })

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
                totalSummary: rollingYearSummary,
                partSummary: monthSummary
            })

            monthSummary.percentages = percentages

            rollingMonthsSummaries.push({
                year: referenceDate.year(),
                monthIndex: referenceDate.month() + 1,
                summary: monthSummary
            })
        }

        const yearWalletSummary = YearWalletSummary.create({
            yearSummary: rollingYearSummary,
            monthSummaries: rollingMonthsSummaries
        })

        return right({
            yearWalletSummary
        })
    }
}
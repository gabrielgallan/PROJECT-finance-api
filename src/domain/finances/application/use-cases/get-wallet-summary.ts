import { Either, left, right } from '@/core/types/either'
import { WalletsRepository } from '../repositories/wallets-repository'
import { TransactionsRepository } from '../repositories/transactions-repository'
import dayjs from 'dayjs'
import { InvalidPeriodError } from './errors/invalid-period-error'
import { WalletSummary } from '../../enterprise/entities/value-objects/summaries/wallet-summary'
import { WalletSummaryCalculator } from '../services/financial-analytics/wallet-summary-calculator'
import { Injectable } from '@nestjs/common'
import { DateInterval } from '@/core/types/repositories/date-interval'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'


interface GetWalletSummaryUseCaseRequest {
  memberId: string
  interval: DateInterval
}

type GetWalletSummaryUseCaseResponse = Either<
  ResourceNotFoundError
  | InvalidPeriodError,
  {
    summary: WalletSummary
  }
>

@Injectable()
export class GetWalletSummaryUseCase {
  constructor(
    private walletsRepository: WalletsRepository,
    private transactionsRepository: TransactionsRepository,
  ) { }

  async execute({
    memberId,
    interval
  }: GetWalletSummaryUseCaseRequest): Promise<GetWalletSummaryUseCaseResponse> {
    const startDateJs = dayjs(interval.startDate)
    const endDateJs = dayjs(interval.endDate)

    if (endDateJs.isBefore(startDateJs)) {
      return left(new InvalidPeriodError())
    }

    const wallet = await this.walletsRepository.findByHolderId(memberId)

    if (!wallet) {
      return left(new ResourceNotFoundError())
    }

    const transactions =
      await this.transactionsRepository.findManyByQuery({
        walletId: wallet.id.toString(),
        interval
      })

    const summary = WalletSummaryCalculator.calculate({
      walletId: wallet.id,
      interval,
      transactions
    })

    return right({
      summary,
    })
  }
}

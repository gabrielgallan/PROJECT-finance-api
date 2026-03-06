import { BadRequestException, Controller, Get, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { ListWalletTransactionsUseCase } from '@/domain/finances/application/use-cases/list-wallet-transactions';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import z from 'zod';
import { DateInterval } from '@/core/types/repositories/date-interval';
import { TransactionPresenter } from '../../presenters/transaction-presenter';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InvalidPeriodError } from '@/domain/finances/application/use-cases/errors/invalid-period-error';

const listQuerySchema = z.object({
    categoryId: z.string().uuid().optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    start: z.coerce.date().optional(),
    end: z.coerce.date().optional(),
})

type ListQueryDTO = z.infer<typeof listQuerySchema>

@Controller('/api')
@ApiTags('Transactions')
export class ListWalletTransactionsController {
    constructor(
        private listTransactions: ListWalletTransactionsUseCase
    ) { }

    @Get('/wallet/transactions')
    @ApiOperation({ summary: 'list wallet transactions with pagination and optional filters' })
    async handle(
        @CurrentUser() user: UserPayload,
        @Query(new ZodValidationPipe(listQuerySchema)) query: ListQueryDTO
    ) {
        const { categoryId, page, limit, start, end } = query

        let interval: DateInterval

        if (start && end) {
            interval = { startDate: start, endDate: end }
        } else {
            const now = new Date()
            const oneMonthAgo = new Date()

            oneMonthAgo.setMonth(now.getMonth() - 1)

            interval = {
                startDate: oneMonthAgo,
                endDate: now
            }
        }

        const result = await this.listTransactions.execute({
            memberId: user.sub,
            filters: {
                categoryId,
                interval,
            },
            page,
            limit
        })

        if (result.isLeft()) {
            const error = result.value

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message)

                case InvalidPeriodError:
                    throw new BadRequestException(error.message)

                default:
                    throw new InternalServerErrorException()
            }
        }

        return {
            interval: result.value.interval,
            // eslint-disable-next-line @typescript-eslint/unbound-method
            transactions: result.value.transactions.map(TransactionPresenter.toHTTP),
            pagination: result.value.pagination
        }
    }
}

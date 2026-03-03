/*
https://docs.nestjs.com/controllers#controllers
*/

import { BadRequestException, Controller, Get, InternalServerErrorException, Query } from '@nestjs/common';
import { GetWalletSummaryUseCase } from '@/domain/finances/application/use-cases/get-wallet-summary';
import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { InvalidPeriodError } from '@/domain/finances/application/use-cases/errors/invalid-period-error';
import { WalletSummaryPresenter } from '../../presenters/wallet-summary-presenter';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

const getWalletSummaryQuerySchema = z.object({
    start: z.coerce.date(),
    end: z.coerce.date()
})

type GetWalletSummaryQueryDTO = z.infer<typeof getWalletSummaryQuerySchema>

@Controller('/api')
@ApiTags('Summaries')
export class GetWalletSummaryController {
    constructor(
        private getWalletSummary: GetWalletSummaryUseCase
    ) { }

    @Get('/wallet/summary')
    @ApiOperation({ summary: 'get wallet summary for a given period' })
    async handle(
        @CurrentUser() user: UserPayload,
        @Query(new ZodValidationPipe(getWalletSummaryQuerySchema)) query: GetWalletSummaryQueryDTO
    ) {
        const { start, end } = query

        const result = await this.getWalletSummary.execute({
            memberId: user.sub,
            interval: {
                startDate: start,
                endDate: end
            }
        })

        if (result.isLeft()) {
            const error = result.value

            switch (error.constructor) {
                case InvalidPeriodError:
                    throw new BadRequestException(error.message)

                default:
                    throw new InternalServerErrorException()
            }
        }

        return {
            summary: WalletSummaryPresenter.toHTTP(result.value.summary)
        }
    }
}

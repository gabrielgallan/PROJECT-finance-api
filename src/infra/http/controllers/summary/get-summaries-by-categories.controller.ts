/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { WalletSummaryPresenter } from '../../presenters/wallet-summary-presenter';
import { GetWalletSummariesByCategoriesUseCase } from '@/domain/finances/application/use-cases/get-wallet-summaries-by-categories';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

const querySchema = z.object({
    start: z.coerce.date(),
    end: z.coerce.date()
})

type GetSummariesByCategoriesQueryDTO = z.infer<typeof querySchema>

@Controller('/api')
@ApiTags('Summaries')
export class GetSummariesByCategoriesController {
    constructor(
        private getSummariesByCategories: GetWalletSummariesByCategoriesUseCase
    ) { }

    @Get('/wallet/categories/summary')
    @ApiOperation({ summary: 'get wallet summaries grouped by categories for a given period' })
    async handle(
        @CurrentUser() user: UserPayload,
        @Query(new ZodValidationPipe(querySchema)) query: GetSummariesByCategoriesQueryDTO
    ) {
        const { start, end } = query

        const result = await this.getSummariesByCategories.execute({
            memberId: user.sub,
            interval: {
                startDate: start,
                endDate: end
            }
        })

        if (result.isLeft()) {
            const error = result.value

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message)

                default:
                    throw new InternalServerErrorException()
            }
        }

        return {
            total: WalletSummaryPresenter.toHTTP(result.value.summary),
            // eslint-disable-next-line @typescript-eslint/unbound-method
            categories: result.value.categoriesSummaries.map(WalletSummaryPresenter.toHTTP)
        }
    }
}

/*
https://docs.nestjs.com/controllers#controllers
*/

import { BadRequestException, Controller, Get, InternalServerErrorException, NotFoundException, Query } from '@nestjs/common';
import { GetWalletSummaryUseCase } from '@/domain/finances/application/use-cases/get-wallet-summary';
import { z } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { InvalidPeriodError } from '@/domain/finances/application/use-cases/errors/invalid-period-error';
import { WalletSummaryPresenter } from '../../presenters/wallet-summary-presenter';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { ErrorResponseDto } from '../../errors/api-error-response';
import { GetWalletSummaryQueryDTO } from './dto/responses/get-wallet-summary-query.dto';
import { GetWalletSummaryResponseDTO } from './dto/responses/get-wallet-summary-response.dto';

const getWalletSummaryQuerySchema = z.object({
    start: z.coerce.date(),
    end: z.coerce.date()
})

type GetWalletSummaryQuerySchemaDTO = z.infer<typeof getWalletSummaryQuerySchema>

@Controller('/api')
@ApiTags('Summaries')
export class GetWalletSummaryController {
    constructor(
        private getWalletSummary: GetWalletSummaryUseCase
    ) { }

    @Get('/wallet/summary')
    @ApiOperation({ summary: 'get wallet summary for a given period' })
    @ApiQuery({ type: GetWalletSummaryQueryDTO })
    @ApiOkResponse({ description: 'Wallet summary retrieved successfully', type: GetWalletSummaryResponseDTO })
    @ApiNotFoundResponse({ description: 'User not found error', type: ErrorResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid period or query params', type: ErrorResponseDto })
    async handle(
        @CurrentUser() user: UserPayload,
        @Query(new ZodValidationPipe(getWalletSummaryQuerySchema)) query: GetWalletSummaryQuerySchemaDTO
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

                case ResourceNotFoundError:
                    throw new NotFoundException(error.message)

                default:
                    throw new InternalServerErrorException()
            }
        }

        return {
            summary: WalletSummaryPresenter.toHTTP(result.value.summary)
        }
    }
}

import { Controller, Get, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { CacheRepository } from '@/infra/cache/cache-repository';
import { GetGetCurrentMonthProgressUseCase } from '@/domain/finances/application/use-cases/get-current-month-progress';
import { MonthProgressPresenter } from '../../presenters/month-progress-presenter';

@Controller('/api')
@ApiTags('Summaries')
export class GetCurrentMonthProgressController {
    constructor(
        private getCurrentMonthProgress: GetGetCurrentMonthProgressUseCase,
        private cacheRepository: CacheRepository
    ) { }

    @Get('/wallet/summary/month')
    @ApiOperation({ summary: 'get current month progress' })
    @ApiOkResponse({ description: 'Current month progress retrieved successfully' })
    @ApiNotFoundResponse({ description: 'User not found error' })
    async handle(
        @CurrentUser() user: UserPayload,
    ) {
        const cacheKey = `progress:month:${user.sub}`

        const cacheHit = await this.cacheRepository.get(cacheKey)

        if (cacheHit) {
            return {
                progress: JSON.parse(cacheHit)
            }
        }

        const result = await this.getCurrentMonthProgress.execute({
            memberId: user.sub
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

        const progress = MonthProgressPresenter.toHTTP(result.value.progress)

        await this.cacheRepository.set(cacheKey, JSON.stringify(progress))

        return {
            progress
        }
    }
}

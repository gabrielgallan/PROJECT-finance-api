import { Controller, Get, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { GetRollingYearProgressUseCase } from '@/domain/finances/application/use-cases/get-rolling-yearly-progress';
import { YearProgressPresenter } from '../../presenters/year-progress-presenter';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { CacheRepository } from '@/infra/cache/cache-repository';
import { ErrorResponseDto } from '../../errors/api-error-response';
import { GetRollingYearProgressResponseDTO } from './dto/responses/get-rolling-year-progress-response.dto';

@Controller('/api')
@ApiTags('Summaries')
export class GetRollingYearProgressController {
    constructor(
        private getRollingYearProgress: GetRollingYearProgressUseCase,
        private cacheRepository: CacheRepository
    ) { }

    @Get('/wallet/summary/year')
    @ApiOperation({ summary: 'get rolling year progress' })
    @ApiOkResponse({ description: 'Rolling year progress retrieved successfully', type: GetRollingYearProgressResponseDTO })
    @ApiNotFoundResponse({ description: 'User not found error', type: ErrorResponseDto })
    async handle(
        @CurrentUser() user: UserPayload,
    ) {
        const cacheKey = `progress:year:${user.sub}`

        const cacheHit = await this.cacheRepository.get(cacheKey)

        if (cacheHit) {
            return {
                progress: JSON.parse(cacheHit)
            }
        }

        const result = await this.getRollingYearProgress.execute({
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

        const progress = YearProgressPresenter.toHTTP(result.value.progress)

        await this.cacheRepository.set(cacheKey, JSON.stringify(progress))

        return {
            progress
        }
    }
}

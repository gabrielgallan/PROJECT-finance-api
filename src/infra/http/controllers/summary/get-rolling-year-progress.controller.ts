import { Controller, Get, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { GetRollingYearProgressUseCase } from '@/domain/finances/application/use-cases/get-rolling-yearly-progress';
import { YearProgressPresenter } from '../../presenters/year-progress-presenter';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

@Controller('/api')
@ApiTags('Summaries')
export class GetRollingYearProgressController {
    constructor(
        private getRollingYearProgress: GetRollingYearProgressUseCase
    ) { }

    @Get('/wallet/summary/year')
    @ApiOperation({ summary: 'get rolling year progress' })
    async handle(
        @CurrentUser() user: UserPayload,
    ) {
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

        return {
            progress: YearProgressPresenter.toHTTP(result.value.progress)
        }
    }
}

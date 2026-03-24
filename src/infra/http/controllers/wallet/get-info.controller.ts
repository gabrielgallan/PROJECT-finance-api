import { Controller, Get, HttpCode, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { UserPayload } from '@/infra/auth/jwt.strategy'
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { GetWalletInfoUseCase } from '@/domain/finances/application/use-cases/get-wallet-info'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { WalletPresenter } from '../../presenters/wallet-presenter'
import { ErrorResponseDto } from '../../errors/api-error-response'
import { createZodDto } from 'nestjs-zod'
import z from 'zod'

class GetWalletResponseDTO extends createZodDto(z.object({
    wallet: z.object({
        balance: z.number(),
        createdAt: z.string(),
        updatedAt: z.string().nullable()
    })
})) { }

@ApiTags('Wallet')
@Controller('/api')
export class GetWalletInfoController {
    constructor(
        private getWalletInfo: GetWalletInfoUseCase
    ) { }

    @Get('/wallet')
    @HttpCode(200)
    @ApiOperation({ summary: 'get wallet info' })
    @ApiOkResponse({ description: 'Wallet info retrieved successfully', type: GetWalletResponseDTO })
    @ApiNotFoundResponse({ description: 'User not found error', type: ErrorResponseDto })
    async handle(
        @CurrentUser() user: UserPayload,
    ) {
        const result = await this.getWalletInfo.execute({
            memberId: user.sub,
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
            wallet: WalletPresenter.toHTTP(result.value.wallet)
        }
    }
}

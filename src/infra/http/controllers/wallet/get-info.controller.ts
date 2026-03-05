import { Controller, Get, HttpCode, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { UserPayload } from '@/infra/auth/jwt.strategy'
import { ApiTags } from '@nestjs/swagger'
import { GetWalletInfoUseCase } from '@/domain/finances/application/use-cases/get-wallet-info'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { WalletPresenter } from '../../presenters/wallet-presenter'

@ApiTags('Wallet')
@Controller('/api')
export class GetWalletInfoController {
    constructor(
        private getWalletInfo: GetWalletInfoUseCase
    ) { }

    @Get('/wallet')
    @HttpCode(200)
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

        return WalletPresenter.toHTTP(result.value.wallet)
    }
}

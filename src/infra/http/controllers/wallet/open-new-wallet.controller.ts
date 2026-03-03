import { Body, ConflictException, Controller, InternalServerErrorException, NotFoundException, Post } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { UserPayload } from '@/infra/auth/jwt.strategy'
import { OpenWalletUseCase } from '@/domain/finances/application/use-cases/open-new-wallet'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { MemberAlreadyHasWalletError } from '@/domain/finances/application/use-cases/errors/member-alredy-has-wallet-error'
import { ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'

const openWalletBodySchema = z.object({
  initialBalance: z.coerce.number().optional()
})

class OpenWalletBodyDTO extends createZodDto(openWalletBodySchema) { }

@ApiTags('Wallet')
@Controller('/api')
export class OpenWalletController {
  constructor(
    private openWallet: OpenWalletUseCase
  ) { }

  @Post('/wallets')
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(openWalletBodySchema)) body: OpenWalletBodyDTO
  ) {
    const { initialBalance } = body

    const result = await this.openWallet.execute({
      memberId: user.sub,
      initialBalance
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)

        case MemberAlreadyHasWalletError:
          throw new ConflictException(error.message)

        default:
          return new InternalServerErrorException()
      }
    }

    return
  }
}

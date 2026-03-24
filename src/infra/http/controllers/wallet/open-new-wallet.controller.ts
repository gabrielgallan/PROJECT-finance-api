import { BadRequestException, Body, ConflictException, Controller, InternalServerErrorException, NotFoundException, Post } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import type { UserPayload } from '@/infra/auth/jwt.strategy'
import { OpenWalletUseCase } from '@/domain/finances/application/use-cases/open-new-wallet'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { MemberAlreadyHasWalletError } from '@/domain/finances/application/use-cases/errors/member-alredy-has-wallet-error'
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { InvalidPositiveNumberError } from '@/core/errors/invalid-positive-number-error'
import { ErrorResponseDto } from '../../errors/api-error-response'

const openWalletBodySchema = z.object({
  balance: z.coerce.number().optional()
})

class OpenWalletBodyDTO extends createZodDto(openWalletBodySchema) { }

@ApiTags('Wallet')
@Controller('/api')
export class OpenWalletController {
  constructor(
    private openWallet: OpenWalletUseCase
  ) { }

  @Post('/wallets')
  @ApiOperation({ summary: 'Open a new wallet' })
  @ApiCreatedResponse({ description: 'Wallet opened successfully' })
  @ApiNotFoundResponse({ description: 'User not found error', type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'Member already has a wallet error', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid balance error', type: ErrorResponseDto })
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(openWalletBodySchema)) body: OpenWalletBodyDTO
  ) {
    const { balance } = body

    const result = await this.openWallet.execute({
      memberId: user.sub,
      balance
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)

        case MemberAlreadyHasWalletError:
          throw new ConflictException(error.message)

        case InvalidPositiveNumberError:
          throw new BadRequestException(error.message)

        default:
          throw new InternalServerErrorException()
      }
    }

    return
  }
}

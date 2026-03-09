import { Body, Controller, InternalServerErrorException, NotFoundException, Post } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { Public } from '@/infra/auth/public'
import { RequestPasswordRecoverUseCase } from '@/domain/identity/application/use-cases/request-password-recover'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { ErrorResponseDto } from '../../errors/api-error-response'

const bodySchema = z.object({
  email: z.string().email()
})

class RequestPasswordRecoverBodyDTO extends createZodDto(bodySchema) { }

@Controller('/api')
@Public()
@ApiTags('Authentication')
export class RequestPasswordRecoverController {
  constructor(
    private requestPasswordRecover: RequestPasswordRecoverUseCase
  ) { }

  @Post('/password/recover')
  @ApiOperation({ summary: 'request password recover' })
  @ApiCreatedResponse({ description: 'Password recover requested successfully' })
  @ApiNotFoundResponse({ type: ErrorResponseDto, description: 'No user found with the provided email' })
  async handle(
    @Body(new ZodValidationPipe(bodySchema)) body: RequestPasswordRecoverBodyDTO
  ) {
    const { email } = body

    const result = await this.requestPasswordRecover.execute({ email })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)

        default:
          throw new InternalServerErrorException()
      }
    }

    return
  }
}

import { Body, Controller, InternalServerErrorException, Post } from '@nestjs/common'
import z from 'zod'
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe'
import { Public } from '@/infra/auth/public'
import { AuthenticateWithProviderUseCase } from '@/domain/identity/application/use-cases/authenticate-with-provider'
import { ApiBadGatewayResponse, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { createZodDto } from 'nestjs-zod'
import { AccountProvider } from '@prisma/client'
import { ErrorResponseDto } from '../../errors/api-error-response'
import { AuthenticateResponseDTO } from './authenticate.controller'

const bodySchema = z.object({
    code: z.string()
})

class AuthenticateWithGithubBodyDTO extends createZodDto(bodySchema) { }

@Controller('/api')
@Public()
@ApiTags('Authentication')
export class AuthenticateWithGithubController {
    constructor(
        private authenticateWithGitHub: AuthenticateWithProviderUseCase
    ) { }

    @Post('/sessions/github')
    @ApiOperation({ summary: 'authenticate with github' })
    @ApiCreatedResponse({ description: 'Authenticated successfully', type: AuthenticateResponseDTO })
    @ApiBadGatewayResponse({ type: ErrorResponseDto,  description: 'Failed to authenticate with GitHub' })
    async handle(
        @Body(new ZodValidationPipe(bodySchema)) body: AuthenticateWithGithubBodyDTO
    ) {
        const { code } = body

        const result = await this.authenticateWithGitHub.execute({
            provider: AccountProvider.GITHUB,
            code
        })

        if (result.isLeft()) {
            throw new InternalServerErrorException()
        }

        return {
            token: result.value.token
        }
    }
}

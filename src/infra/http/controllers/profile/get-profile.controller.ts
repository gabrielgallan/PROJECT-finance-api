import { Controller, Get, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { CurrentUser } from '../../../auth/current-user-decorator'
import type { UserPayload } from '../../../auth/jwt.strategy'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { GetProfileUseCase } from '@/domain/identity/application/use-cases/get-profile'
import { UserPresenter, UserPresenterToHTTP } from '../../presenters/user-presenter'
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger'

class GetProfileResponseDTO implements UserPresenterToHTTP {

  @ApiProperty()
  name: string

  @ApiProperty()
  email: string

  @ApiProperty()
  avatarUrl: string | null
}

@Controller('/api')
@ApiTags('Profile')
export class GetProfileController {
  constructor(
    private getProfile: GetProfileUseCase
  ) { }

  @Get('/profile')
  @ApiOperation({ summary: 'get user profile' })
  @ApiOkResponse({ description: 'User profile retrieved successfully', type: GetProfileResponseDTO })
  @ApiNotFoundResponse({ description: 'User not found error' })
  async handle(
    @CurrentUser() user: UserPayload
  ) {
    const result = await this.getProfile.execute({
      userId: user.sub
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
      user: UserPresenter.toHTTP(result.value.user)
    }
  }
}

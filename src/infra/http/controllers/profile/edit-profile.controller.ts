import {
  Body,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Put,
} from "@nestjs/common";
import { CurrentUser } from "../../../auth/current-user-decorator";
import type { UserPayload } from "../../../auth/jwt.strategy";
import { ResourceNotFoundError } from "@/core/errors/resource-not-found-error";
import { EditProfileUseCase } from "@/domain/identity/application/use-cases/edit-profile";
import { UserPresenter } from "../../presenters/user-presenter";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { ErrorResponseDto } from "../../errors/api-error-response";
import { ZodValidationPipe } from "node_modules/nestjs-zod/dist/index.mjs";

const editProfileBodySchema = z.object({
  name: z.string().optional(),
});

class EditProfileBodyDTO extends createZodDto(editProfileBodySchema) {}

class EditProfileResponseDTO extends createZodDto(
  z.object({
    user: z.object({
      name: z.string(),
      email: z.string(),
      avatarUrl: z.string().nullable(),
    }),
  }),
) {}

@Controller("/api")
@ApiTags("Profile")
export class EditProfileController {
  constructor(private editProfile: EditProfileUseCase) {}

  @Put("/profile")
  @ApiOperation({ summary: "edit user profile" })
  @ApiOkResponse({
    description: "User profile edited successfully",
    type: EditProfileResponseDTO,
  })
  @ApiNotFoundResponse({
    description: "User not found error",
    type: ErrorResponseDto,
  })
  async handle(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(editProfileBodySchema))
    body: EditProfileBodyDTO,
  ) {
    const result = await this.editProfile.execute({
      userId: user.sub,
      name: body.name,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);

        default:
          throw new InternalServerErrorException();
      }
    }

    return {
      user: UserPresenter.toHTTP(result.value.user),
    };
  }
}

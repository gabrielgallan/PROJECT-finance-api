/*
https://docs.nestjs.com/controllers#controllers
*/

import { CreateWalletCategoryUseCase } from '@/domain/finances/application/use-cases/create-wallet-category';
import { Body, ConflictException, Controller, Get, HttpCode, InternalServerErrorException, NotFoundException, Param, Post, Put } from '@nestjs/common';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { CategoryAlreadyExistsError } from '@/domain/finances/application/use-cases/errors/category-already-exists-error';
import { ListWalletCategoriesUseCase } from '@/domain/finances/application/use-cases/list-wallet-categories';
import { CategoryPresenter } from '../../presenters/category-presenter';
import { EditWalletCategoryUseCase } from '@/domain/finances/application/use-cases/edit-wallet-category';
import { ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { GetCategoriesResponseDTO } from './dto/responses/create-category-response.dto';
import { ErrorResponseDto } from '../../errors/api-error-response';

const createCategoryBodySchema = z.object({
    name: z.string(),
    description: z.string().optional()
})

const editCategoryBodySchema = z.object({
    name: z.string().optional(),
    description: z.string().optional()
})

const editCategoryParamsSchema = z.object({
    id: z.uuid()
})

class CreateCategoryBodyDTO extends createZodDto(createCategoryBodySchema) { }

class EditCategoryBodyDTO extends createZodDto(editCategoryBodySchema) { }

class EditCategoryParamsDTO extends createZodDto(editCategoryParamsSchema) { }

@Controller('/api/wallet/categories')
@ApiTags('Categories')
export class CategoryController {
    constructor(
        private createCategory: CreateWalletCategoryUseCase,
        private listCategories: ListWalletCategoriesUseCase,
        private editCategory: EditWalletCategoryUseCase,
    ) { }

    @Post()
    @ApiOperation({ summary: 'create a new wallet category' })
    @ApiCreatedResponse({ description: 'The category has been successfully created' })
    @ApiNotFoundResponse({ description: 'No wallet categories found', type: ErrorResponseDto })
    @ApiConflictResponse({ description: 'Category with the same name already exists', type: ErrorResponseDto })
    async create(
        @CurrentUser() user: UserPayload,
        @Body(new ZodValidationPipe(createCategoryBodySchema)) body: CreateCategoryBodyDTO
    ) {
        const { name, description } = body

        const result = await this.createCategory.execute({
            memberId: user.sub,
            categoryName: name,
            categoryDescription: description
        })

        if (result.isLeft()) {
            const error = result.value

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message)

                case CategoryAlreadyExistsError:
                    throw new ConflictException(error.message)

                default:
                    throw new InternalServerErrorException()
            }
        }

        return
    }

    @Get()
    @ApiOperation({ summary: 'list all wallet categories' })
    @ApiOkResponse({ description: 'List of wallet categories', type: GetCategoriesResponseDTO })
    @ApiNotFoundResponse({ description: 'No wallet categories found', type: ErrorResponseDto })
    async list(
        @CurrentUser() user: UserPayload,
    ) {
        const result = await this.listCategories.execute({
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
            // eslint-disable-next-line @typescript-eslint/unbound-method
            categories: result.value.categories.map(CategoryPresenter.toHTTP)
        }
    }

    @Put('/:id')
    @HttpCode(204)
    @ApiOkResponse({ description: 'The category has been successfully updated' })
    @ApiNotFoundResponse({ description: 'Category not found', type: ErrorResponseDto })
    @ApiConflictResponse({ description: 'Category with the same name already exists', type: ErrorResponseDto })
    @ApiOperation({ summary: 'edit an wallet category' })
    async edit(
        @CurrentUser() user: UserPayload,
        @Body(new ZodValidationPipe(editCategoryBodySchema)) body: EditCategoryBodyDTO,
        @Param(new ZodValidationPipe(editCategoryParamsSchema)) params: EditCategoryParamsDTO
    ) {
        const { name, description } = body
        const { id } = params

        const result = await this.editCategory.execute({
            memberId: user.sub,
            categoryId: id,
            name,
            description
        })

        if (result.isLeft()) {
            const error = result.value

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message)

                case CategoryAlreadyExistsError:
                    throw new ConflictException(error.message)

                default:
                    throw new InternalServerErrorException()
            }
        }

        return
    }
}
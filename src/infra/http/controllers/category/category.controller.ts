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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';

const createCategoryBodySchema = z.object({
    name: z.string(),
    description: z.string().optional()
})

const editCategoryBodySchema = z.object({
    name: z.string().optional(),
    description: z.string().optional()
})

const editCategoryParamsSchema = z.object({
    slug: z.string()
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
    async create(
        @CurrentUser() user: UserPayload,
        @Body(new ZodValidationPipe(createCategoryBodySchema)) body: CreateCategoryBodyDTO
    ) {
        console.log(body)
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
    async list(
        @CurrentUser() user: UserPayload,
    ) {
        const result = await this.listCategories.execute({
            memberId: user.sub
        })

        if (result.isLeft()) {
            throw new InternalServerErrorException()
        }

        return {
            // eslint-disable-next-line @typescript-eslint/unbound-method
            categories: result.value.categories.map(CategoryPresenter.toHTTP)
        }
    }

    @Put('/:slug')
    @HttpCode(204)
    @ApiOperation({ summary: 'edit an wallet category' })
    async edit(
        @CurrentUser() user: UserPayload,
        @Body(new ZodValidationPipe(editCategoryBodySchema)) body: EditCategoryBodyDTO,
        @Param(new ZodValidationPipe(editCategoryParamsSchema)) params: EditCategoryParamsDTO
    ) {
        const { name, description } = body
        const { slug } = params

        const result = await this.editCategory.execute({
            memberId: user.sub,
            slug,
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
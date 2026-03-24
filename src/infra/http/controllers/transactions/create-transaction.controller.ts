import { BadRequestException, Body, Controller, InternalServerErrorException, NotFoundException, Post } from '@nestjs/common';
import { CreateTransactionUseCase } from '@/domain/finances/application/use-cases/create-transaction';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import type { UserPayload } from '@/infra/auth/jwt.strategy';
import z from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation-pipe';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { InvalidTransactionOperationError } from '@/domain/finances/application/use-cases/errors/invalid-transaction-operation-error';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { CacheRepository } from '@/infra/cache/cache-repository';
import { InvalidPositiveNumberError } from '@/core/errors/invalid-positive-number-error';
import { ErrorResponseDto } from '../../errors/api-error-response';

const createTransactionBodySchema = z.object({
    categoryId: z.string().uuid().optional(),
    title: z.string(),
    description: z.string().optional(),
    amount: z.coerce.number(),
    operation: z.union([z.literal('income'), z.literal('expense')]),
    method: z.string().optional(),
})

class CreateTransactionBodyDTO extends createZodDto(createTransactionBodySchema) { }

@Controller('/api')
@ApiTags('Transactions')
export class CreateTransactionController {
    constructor(
        private createTransaction: CreateTransactionUseCase,
        private cacheRepository: CacheRepository
    ) { }

    @Post('/wallet/transactions')
    @ApiOperation({ summary: 'create a new transaction' })
    @ApiOkResponse({ description: 'Transaction created successfully' })
    @ApiNotFoundResponse({ description: 'User not found error', type: ErrorResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid transaction data', type: ErrorResponseDto })
    async handle(
        @CurrentUser() user: UserPayload,
        @Body(new ZodValidationPipe(createTransactionBodySchema)) body: CreateTransactionBodyDTO
    ) {
        const { categoryId, title, description, amount, operation, method } = body

        const result = await this.createTransaction.execute({
            memberId: user.sub,
            categoryId,
            title,
            description,
            amount,
            operation,
            method
        })

        if (result.isLeft()) {
            const error = result.value

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new NotFoundException(error.message)

                case InvalidTransactionOperationError:
                    throw new BadRequestException(error.message)

                case InvalidPositiveNumberError:
                    throw new BadRequestException(error.message)

                default:
                    throw new InternalServerErrorException()
            }
        }

        await this.cacheRepository.delete(`progress:year:${user.sub}`)
        await this.cacheRepository.delete(`progress:month:${user.sub}`)

        return
    }
}

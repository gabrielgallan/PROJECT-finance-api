import { WalletsRepository } from '../repositories/wallets-repository'
import { TransactionsRepository } from '../repositories/transactions-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import {
  Transaction,
  TransactionOperation,
} from '@/domain/finances/enterprise/entities/transaction'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InvalidTransactionOperationError } from './errors/invalid-transaction-operation-error'
import { CategoriesRepository } from '../repositories/categories-repository'
import { Injectable } from '@nestjs/common'
import { InvalidPositiveNumberError } from '@/core/errors/invalid-positive-number-error'

interface CreateTransactionUseCaseRequest {
  memberId: string
  categoryId?: string
  title: string
  description?: string
  amount: number
  operation: 'expense' | 'income'
  method?: string
}

type CreateTransactionUseCaseResponse = Either<
  | ResourceNotFoundError
  | InvalidTransactionOperationError,
  { transaction: Transaction }
>

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    private walletsRepository: WalletsRepository,
    private transactionsRepository: TransactionsRepository,
    private categoriesRepository: CategoriesRepository,
  ) { }

  async execute({
    memberId,
    categoryId,
    title,
    description,
    amount,
    operation,
    method,
  }: CreateTransactionUseCaseRequest): Promise<CreateTransactionUseCaseResponse> {
    if (amount <= 0) {
      return left(new InvalidPositiveNumberError())
    }

    const formattedAmount = Math.round(amount * 100) / 100

    const wallet = await this.walletsRepository.findByHolderId(memberId)

    if (!wallet) {
      return left(new ResourceNotFoundError())
    }

    if (categoryId) {
      const category = await this.categoriesRepository.findByIdAndWalletId(
        categoryId,
        wallet.id.toString()
      )

      if (!category) {
        return left(new ResourceNotFoundError())
      }
    }

    let transactionOperation: TransactionOperation

    switch (operation) {
      case 'expense':
        transactionOperation = TransactionOperation.EXPENSE

        wallet.withdraw(formattedAmount)

        break
      case 'income':
        transactionOperation = TransactionOperation.INCOME

        wallet.deposit(formattedAmount)

        break
      default:
        return left(new InvalidTransactionOperationError())
    }

    await this.walletsRepository.save(wallet)

    const transaction = Transaction.create({
      walletId: wallet.id,
      categoryId: categoryId ? new UniqueEntityID(categoryId) : undefined,
      title,
      description,
      amount: formattedAmount,
      operation: transactionOperation,
      method,
    })

    await this.transactionsRepository.create(transaction)

    return right({
      transaction,
    })
  }
}

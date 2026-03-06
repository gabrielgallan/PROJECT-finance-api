import { WalletsRepository } from '../repositories/wallets-repository'
import { TransactionsRepository } from '../repositories/transactions-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Either, left, right } from '@/core/types/either'
import { Transaction } from '@/domain/finances/enterprise/entities/transaction'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { CategoriesRepository } from '../repositories/categories-repository'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { Injectable } from '@nestjs/common'

interface EditTransactionUseCaseRequest {
  memberId: string
  transactionId: string
  categoryId?: string
  title?: string
  description?: string
  method?: string
}

type EditTransactionUseCaseResponse = Either<
  | ResourceNotFoundError
  | NotAllowedError,
  { transaction: Transaction }
>

@Injectable()
export class EditTransactionUseCase {
  constructor(
    private walletsRepository: WalletsRepository,
    private transactionsRepository: TransactionsRepository,
    private categoriesRepository: CategoriesRepository,
  ) { }

  async execute({
    memberId,
    transactionId,
    categoryId,
    title,
    description,
    method,
  }: EditTransactionUseCaseRequest): Promise<EditTransactionUseCaseResponse> {
    const wallet = await this.walletsRepository.findByHolderId(memberId)

    if (!wallet) {
      return left(new ResourceNotFoundError())
    }

    const transaction =
      await this.transactionsRepository.findById(transactionId)

    if (!transaction) {
      return left(new ResourceNotFoundError())
    }

    if (transaction.walletId.toString() !== wallet.id.toString()) {
      return left(new NotAllowedError('You are not allowed to edit this transaction'))
    }

    if (categoryId) {
      const category = await this.categoriesRepository.findByIdAndWalletId(
        categoryId,
        wallet.id.toString()
      )

      if (!category) {
        return left(new ResourceNotFoundError())
      }

      transaction.categoryId = new UniqueEntityID(categoryId)
    }

    if (title) {
      transaction.title = title
    }

    if (method) {
      transaction.method = method
    }

    if (description) {
      transaction.description = description
    }

    await this.transactionsRepository.save(transaction)

    return right({
      transaction,
    })
  }
}

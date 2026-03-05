import { TransactionWithCategory } from "@/domain/finances/enterprise/entities/value-objects/transaction-with-category";

export interface TransactionPresenterToHTTP {
    title: string
    amount: number
    operation: string
    method: string | null
    createdAt: Date
    category: {
        name: string
        slug: string
    } | null
}

export class TransactionPresenter {
    static toHTTP(
        transaction: TransactionWithCategory
    ): TransactionPresenterToHTTP {
        return {
            title: transaction.title,
            amount: transaction.amount.toNumber(),
            operation: transaction.operation,
            method: transaction.method,
            createdAt: transaction.createdAt,
            category: transaction.category
        }
    }
}
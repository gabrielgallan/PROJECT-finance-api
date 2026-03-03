import { TransactionsRepository, PaginatedTransactionsQuery, TransactionsQuery } from "@/domain/finances/application/repositories/transactions-repository";
import { Transaction } from "@/domain/finances/enterprise/entities/transaction";

export class InMemoryTransactionsRepository implements TransactionsRepository {
    public items: Transaction[] = []

    async create(Transaction: Transaction) {
        this.items.push(Transaction)

        return
    }

    async findById(id: string): Promise<Transaction | null> {
        const transaction = this.items.find(t => t.id.toString() === id)

        return transaction ?? null
    }

    async listPaginated({
        walletId,
        categoryId,
        interval,
        pagination
    }: PaginatedTransactionsQuery) {
        const { page, limit } = pagination
        const { startDate, endDate } = interval

        const transactions = this.items.filter(t => {
            return t.walletId.toString() === walletId &&
                t.createdAt.getTime() >= startDate.getTime() &&
                t.createdAt.getTime() <= endDate.getTime()
        })

        const transactionsWithCategory = categoryId ?
            transactions.filter(t => t.categoryId?.toString() === categoryId)
            : transactions

        const paginated = transactionsWithCategory
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice((page - 1) * limit, page * limit)

        return paginated
    }

    async findManyByQuery({
        walletId,
        categoryId,
        interval
    }: TransactionsQuery) {
        const { startDate, endDate } = interval

        const transactions = this.items.filter(t => {
            return t.walletId.toString() === walletId &&
                t.createdAt.getTime() >= startDate.getTime() &&
                t.createdAt.getTime() <= endDate.getTime()
        })

        if (categoryId) {
            return transactions.filter(t => t.categoryId?.toString() === categoryId)
        }

        return transactions
    }

    async save(transaction: Transaction) {
        const transactionIndex = this.items.findIndex(t => t.id.toString() === transaction.id.toString())

        if (transactionIndex >= 0) {
            this.items[transactionIndex] = transaction
        }

        return transaction
    }

    async deleteAllByWalletId(walletId: string) {
        const originalLenght = this.items.length

        const remaining = this.items.filter(a => a.walletId.toString() !== walletId)

        this.items = remaining

        return originalLenght - remaining.length
    }
}
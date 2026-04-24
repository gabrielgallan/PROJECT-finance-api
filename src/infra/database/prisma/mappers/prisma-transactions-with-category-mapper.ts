import { Cash } from "@/domain/finances/enterprise/entities/value-objects/cash";
import { TransactionWithCategory } from "@/domain/finances/enterprise/entities/value-objects/transaction-with-category";
import { Prisma } from "@prisma/client"

type PrismaTransactionWithCategory = Prisma.TransactionGetPayload<{
    select: {
        id: true
        title: true
        amount: true
        operation: true
        method: true
        createdAt: true
        category: {
            select: {
                name: true
                slug: true
            }
        }
    }
}>

export class PrismaTransactionWithCategoryMapper {
    static toDomain(raw: PrismaTransactionWithCategory): TransactionWithCategory {
        return TransactionWithCategory.create(
            {
                transactionId: raw.id,
                title: raw.title,
                amount: Cash.fromAmount(raw.amount.toNumber()),
                operation: raw.operation,
                method: raw.method,
                category: raw.category,
                createdAt: new Date(raw.createdAt),
            }
        )
    }
}
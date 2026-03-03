import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Wallet } from "@/domain/finances/enterprise/entities/wallet";
import { Wallet as PrismaWallet, Prisma } from "@prisma/client"

export class PrismaWalletMapper {
    static toDomain(raw: PrismaWallet): Wallet {
        return Wallet.create(
            {
                holderId: new UniqueEntityID(raw.holderId),
                balance: raw.balance.toNumber(),
                createdAt: new Date(raw.createdAt),
                updatedAt: raw.updatedAt
            },
            new UniqueEntityID(raw.id)
        )
    }

    static toPrisma(wallet: Wallet): Prisma.WalletUncheckedCreateInput {
        return {
            id: wallet.id.toString(),
            holderId: wallet.holderId.toString(),
            balance: wallet.balance,
            createdAt: wallet.createdAt
        }
    }
}
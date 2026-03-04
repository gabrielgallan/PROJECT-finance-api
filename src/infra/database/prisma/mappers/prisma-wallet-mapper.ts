import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { roundMoney } from "@/domain/finances/application/utils/round-money";
import { Wallet } from "@/domain/finances/enterprise/entities/wallet";
import { Wallet as PrismaWallet, Prisma } from "@prisma/client"

export class PrismaWalletMapper {
    static toDomain(raw: PrismaWallet): Wallet {
        return Wallet.create(
            {
                holderId: new UniqueEntityID(raw.holderId),
                balance: roundMoney(raw.balance.toNumber()),
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
            balance: new Prisma.Decimal(wallet.balance.toFixed(2)),
            createdAt: wallet.createdAt
        }
    }
}
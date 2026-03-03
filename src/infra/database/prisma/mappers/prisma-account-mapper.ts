import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Account } from "@/domain/identity/enterprise/entities/account";
import { Account as PrismaAccount } from "@prisma/client";
import { PrismaAccountProviderMapper } from "./prisma-account-provider-mapper";

export class PrismaAccountMapper {
    static toDomain(raw: PrismaAccount): Account {
        return Account.create({
            userId: new UniqueEntityID(raw.userId),
            provider: raw.provider,
            providerUserId: raw.providerAccountId
        },
            new UniqueEntityID(raw.id)
        )
    }

    static toPrisma(account: Account): PrismaAccount {
        const prismaProvider = PrismaAccountProviderMapper.toPrisma(account.provider)

        return {
            id: account.id.toString(),
            provider: prismaProvider,
            providerAccountId: account.providerUserId ?? null,
            userId: account.userId.toString()
        }
    }
}
import { AccountRepository } from "@/domain/identity/application/repositories/account-repository";
import { PrismaService } from "../prisma.service";
import { Account } from "@/domain/identity/enterprise/entities/account";
import { AccountProvider } from "@prisma/client";
import { PrismaAccountMapper } from "../mappers/prisma-account-mapper";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PrismaAccountsRepository implements AccountRepository {
    constructor(private prisma: PrismaService) { }

    async create(account: Account) {
        const data = PrismaAccountMapper.toPrisma(account)

        await this.prisma.account.create({
            data
        })
    }

    async findByProviderAndUserId(provider: string, userId: string) {
        let prismaProvider: AccountProvider

        switch (provider) {
            case 'GITHUB':
                prismaProvider = AccountProvider.GITHUB
                break
            default:
                throw new Error(`Invalid provider: ${provider}`)
        }

        const account = await this.prisma.account.findUnique({
            where: {
                provider_userId: {
                    provider: prismaProvider,
                    userId
                }
            }
        })

        if (!account) {
            return null
        }

        return PrismaAccountMapper.toDomain(account)
    }
}
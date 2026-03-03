import { WalletsRepository } from "@/domain/finances/application/repositories/wallets-repository";
import { Wallet } from "@/domain/finances/enterprise/entities/wallet";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PrismaWalletMapper } from "../mappers/prisma-wallet-mapper";

/* eslint-disable */
@Injectable()
export class PrismaWalletsRepository implements WalletsRepository {
    constructor(private prisma: PrismaService) { }

    async create(wallet: Wallet): Promise<void> {
        const prismaWallet = await this.prisma.wallet.create({
            data: PrismaWalletMapper.toPrisma(wallet)
        })

        return
    }

    async findById(id: string) {
        const prismaWallet = await this.prisma.wallet.findUnique({
            where: { id }
        })

        if (!prismaWallet) {
            return null
        }

        return PrismaWalletMapper.toDomain(prismaWallet)
    }

    async findByHolderId(holderId: string) {
        const prismaWallet = await this.prisma.wallet.findUnique({
            where: { holderId }
        })

        if (!prismaWallet) {
            return null
        }

        return PrismaWalletMapper.toDomain(prismaWallet)
    }

    async save(wallet: Wallet) {
        const data = PrismaWalletMapper.toPrisma(wallet)

        const updated = await this.prisma.wallet.update({
            where: { id: wallet.id.toString() },
            data
        })

        return PrismaWalletMapper.toDomain(updated)
    }

    async delete(wallet: Wallet) {
        const rows = await this.prisma.wallet.delete({
            where: {
                id: wallet.id.toString()
            }
        })

        return
    }

}
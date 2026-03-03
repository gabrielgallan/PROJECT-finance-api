import { WalletsRepository } from "@/domain/finances/application/repositories/wallets-repository";
import { Wallet } from "@/domain/finances/enterprise/entities/wallet";

export class InMemoryWalletsRepository implements WalletsRepository {
    public items: Wallet[] = []

    async create(wallet: Wallet) {
        this.items.push(wallet)
        return
    }

    async findByHolderId(holderId: string): Promise<Wallet | null> {
        const wallet = this.items.find((a) => a.holderId.toString() === holderId)

        return wallet ?? null
    }

    async findById(id: string) {
        const wallet = this.items.find((a) => a.id.toString() === id)

        return wallet ?? null
    }

    async save(wallet: Wallet) {
        const walletIndex = this.items.findIndex(a => a.id.toString() === wallet.id.toString())

        if (walletIndex >= 0) {
            this.items[walletIndex] = wallet
        }

        return wallet
    }

    async delete(wallet: Wallet) {
        const walletIndex = this.items.findIndex(a => a.id.toString() === wallet.id.toString())

        this.items.splice(walletIndex, 1)

        return
    }
}
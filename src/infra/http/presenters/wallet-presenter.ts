import { Wallet } from "@/domain/finances/enterprise/entities/wallet";

export interface WalletPresenterToHTTP {
    balance: number
    createdAt: Date
    updatedAt: Date | null
}

export class WalletPresenter {
    static toHTTP(
        wallet: Wallet
    ): WalletPresenterToHTTP {
        return {
            balance: wallet.balance.toNumber(),
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt ?? null
        }
    }
}
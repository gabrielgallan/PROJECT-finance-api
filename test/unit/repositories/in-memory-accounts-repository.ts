import { AccountRepository } from "@/domain/identity/application/repositories/account-repository";
import { Account } from "@/domain/identity/enterprise/entities/account";

export class InMemoryAccountsRepository implements AccountRepository {
    public items: Account[] = []

    async create(account: Account) {
        this.items.push(account)

        return
    }

    async findByProviderAndUserId(
        provider: string,
        userId: string
    ) {
        const account = this.items.find(item => {
            return item.provider === provider && item.userId.toString() === userId
        })

        return account ?? null
    }
}
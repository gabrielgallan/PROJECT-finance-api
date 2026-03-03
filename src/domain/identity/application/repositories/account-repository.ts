import { Account } from "../../enterprise/entities/account";

export abstract class AccountRepository {
    abstract create(account: Account): Promise<void>
    abstract findByProviderAndUserId(provider: string, userId: string): Promise<Account | null>
}
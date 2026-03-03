import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Wallet, WalletProps } from "@/domain/finances/enterprise/entities/wallet";
import { faker } from "@faker-js/faker";

export function makeWallet(
    override: Partial<WalletProps> = {},
    id?: UniqueEntityID
) {
    const wallet = Wallet.create({
        holderId: new UniqueEntityID(),
        balance: faker.number.int({ min: 0, max: 99999 }),
        ...override
    }, id)

    return wallet
}
import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Cash } from "@/domain/finances/enterprise/entities/value-objects/cash";
import { Wallet, WalletProps } from "@/domain/finances/enterprise/entities/wallet";
import { faker } from "@faker-js/faker";

export function makeWallet(
    override: Partial<WalletProps> = {},
    id?: UniqueEntityID
) {
    const wallet = Wallet.create({
        holderId: new UniqueEntityID(),
        balance: Cash.fromAmount(faker.number.int({ min: 0, max: 99999 })),
        ...override
    }, id)

    return wallet
}
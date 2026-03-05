import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { Transaction, TransactionOperation, TransactionProps } from "@/domain/finances/enterprise/entities/transaction";
import { Cash } from "@/domain/finances/enterprise/entities/value-objects/cash";
import { faker } from "@faker-js/faker";

export function makeTransaction(
    override: Partial<TransactionProps> = {},
    id?: UniqueEntityID
) {
    const transaction = Transaction.create({
        walletId: new UniqueEntityID(),
        title: faker.lorem.words(2),
        amount: Cash.fromAmount(faker.number.int({ min: 1, max: 99999 })),
        operation: TransactionOperation.INCOME,
        ...override
    }, id)

    return transaction
}
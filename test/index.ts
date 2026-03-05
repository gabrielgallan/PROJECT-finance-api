import { UniqueEntityID } from "@/core/entities/unique-entity-id"
import { Cash } from "@/domain/finances/enterprise/entities/value-objects/cash"
import { Wallet } from "@/domain/finances/enterprise/entities/wallet"

const wallet = Wallet.create({
    holderId: new UniqueEntityID(),
    balance: Cash.fromAmount(100.85),
})

wallet.withdraw(5000)
console.log(wallet.balance.toNumber())
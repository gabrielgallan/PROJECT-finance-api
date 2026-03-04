import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Entity } from '@/core/entities/entity'
import { Optional } from '@/core/types/optional'
import { roundMoney } from '../../application/utils/round-money'

export interface WalletProps {
  holderId: UniqueEntityID
  balance: number
  createdAt: Date
  updatedAt?: Date | null
}

export class Wallet extends Entity<WalletProps> {
  static create(
    props: Optional<WalletProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ) {
    const wallet = new Wallet(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id,
    )

    return wallet
  }

  // => Getters
  get balance() {
    return this.props.balance
  }

  get holderId() {
    return this.props.holderId
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  // => Methods
  private touch() {
    this.props.updatedAt = new Date()
  }

  deposit(value: number) {
    this.props.balance = roundMoney(this.props.balance + value)
    this.touch()
  }

  withdraw(value: number) {
    this.props.balance = roundMoney(this.props.balance - value)
    this.touch()
  }
}

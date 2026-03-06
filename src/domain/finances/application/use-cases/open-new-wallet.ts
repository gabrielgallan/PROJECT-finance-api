import { MembersRepository } from '../repositories/members-repository'
import { Wallet } from '@/domain/finances/enterprise/entities/wallet'
import { WalletsRepository } from '../repositories/wallets-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { MemberAlreadyHasWalletError } from './errors/member-alredy-has-wallet-error'
import { Either, left, right } from '@/core/types/either'
import { Injectable } from '@nestjs/common'
import { InvalidPositiveNumberError } from '@/core/errors/invalid-positive-number-error'
import { Cash } from '../../enterprise/entities/value-objects/cash'

interface OpenWalletUseCaseRequest {
  memberId: string
  balance?: number
}

type OpenWalletUseCaseResponse = Either<
  | ResourceNotFoundError
  | MemberAlreadyHasWalletError
  | InvalidPositiveNumberError,
  { wallet: Wallet }
>

@Injectable()
export class OpenWalletUseCase {
  constructor(
    private membersRepository: MembersRepository,
    private walletsRepository: WalletsRepository,
  ) { }

  async execute({
    memberId,
    balance,
  }: OpenWalletUseCaseRequest): Promise<OpenWalletUseCaseResponse> {
    if (balance && balance <= 0) {
      return left(new InvalidPositiveNumberError())
    }

    const member = await this.membersRepository.findById(memberId)

    if (!member) {
      return left(new ResourceNotFoundError())
    }

    const memberWallet = await this.walletsRepository.findByHolderId(memberId)

    if (memberWallet) {
      return left(new MemberAlreadyHasWalletError())
    }

    const wallet = Wallet.create({
      holderId: member.id,
      balance: balance ? Cash.fromAmount(balance) : Cash.fromAmount(0),
    })

    await this.walletsRepository.create(wallet)

    return right({
      wallet,
    })
  }
}

import { Either, left, right } from '@/core/types/either'
import { WalletsRepository } from '../repositories/wallets-repository'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Wallet } from '../../enterprise/entities/wallet'

interface GetWalletInfoUseCaseRequest {
    memberId: string
}

type GetWalletInfoUseCaseResponse = Either<
    ResourceNotFoundError,
    {
        wallet: Wallet
    }
>

@Injectable()
export class GetWalletInfoUseCase {
    constructor(
        private walletsRepository: WalletsRepository,
    ) { }

    async execute({
        memberId,
    }: GetWalletInfoUseCaseRequest): Promise<GetWalletInfoUseCaseResponse> {
        const wallet = await this.walletsRepository.findByHolderId(memberId)

        if (!wallet) {
            return left(new ResourceNotFoundError())
        }

        return right({
            wallet
        })
    }
}
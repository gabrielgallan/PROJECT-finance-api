import { Either, left, right } from '@/core/types/either'
import { WalletsRepository } from '../repositories/wallets-repository'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

interface GetWalletInfoUseCaseRequest {
    memberId: string
}

type GetWalletInfoUseCaseResponse = Either<
    ResourceNotFoundError,
    {
        balance: number,
        createdAt: Date,
        updatedAt: Date | null
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
            balance: wallet.balance,
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt ?? null
        })
    }
}
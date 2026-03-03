import { Either, right } from '@/core/types/either'
import { Injectable } from '@nestjs/common'
import { Encrypter } from '../cryptography/encrypter'
import { UsersRepository } from '../repositories/users-repository'
import { AccountRepository } from '../repositories/account-repository'
import { AuthProvider } from '../auth/auth-provider'
import { User } from '../../enterprise/entities/user'
import { Account } from '../../enterprise/entities/account'

interface AuthenticateWithProviderUseCaseRequest {
    provider: string
    code: string
}

type AuthenticateWithProviderUseCaseResponse = Either<
    null,
    { token: string }
>

@Injectable()
export class AuthenticateWithProviderUseCase {
    constructor(
        private usersRepository: UsersRepository,
        private accountRepository: AccountRepository,
        private authProvider: AuthProvider,
        private encrypter: Encrypter,
    ) { }

    async execute({
        provider,
        code
    }: AuthenticateWithProviderUseCaseRequest): Promise<AuthenticateWithProviderUseCaseResponse> {
        const { id, email, name, avatarUrl } = await this.authProvider.signIn({ code })

        let user = await this.usersRepository.findByEmail(email)

        if (!user) {
            user = User.create({
                name,
                email,
                avatarUrl
            })

            await this.usersRepository.create(user)
        }

        const account = await this.accountRepository.findByProviderAndUserId(
            provider,
            user.id.toString()
        )

        if (!account) {
            const newAccount = Account.create({
                userId: user.id,
                provider,
                providerUserId: id
            })

            await this.accountRepository.create(newAccount)
        }

        const token = await this.encrypter.encrypt({ sub: user.id.toString() })

        return right({
            token
        })
    }
}

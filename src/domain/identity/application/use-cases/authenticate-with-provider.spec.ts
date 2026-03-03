import { Encrypter } from '../cryptography/encrypter'
import { EncrypterStub } from 'test/unit/cryptography/encrypter'
import { InMemoryUsersRepository } from 'test/unit/repositories/in-memory-users-repository'
import { AuthenticateWithProviderUseCase } from './authenticate-with-provider'
import { InMemoryAccountsRepository } from 'test/unit/repositories/in-memory-accounts-repository'
import { AuthProvider } from '../auth/auth-provider'
import { AuthProviderStub } from 'test/unit/auth/auth-provider'

let usersRepository: InMemoryUsersRepository
let accountsRepository: InMemoryAccountsRepository
let authProvider: AuthProvider
let encrypter: Encrypter

let sut: AuthenticateWithProviderUseCase

describe('Authenticate with  provider use case', () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        accountsRepository = new InMemoryAccountsRepository()
        authProvider = new AuthProviderStub()
        encrypter = new EncrypterStub()

        sut = new AuthenticateWithProviderUseCase(
            usersRepository,
            accountsRepository,
            authProvider,
            encrypter
        )
    })

    it('should be able to authenticate with  provider', async () => {
        const result = await sut.execute({
            provider: 'fake-provider',
            code: 'fake-provider-code'
        })

        expect(result.isRight()).toBe(true)

        expect(accountsRepository.items[0].providerUserId).toBe('-user-id')

        expect(usersRepository.items[0].email).toBe('johndoe@example.com')
        expect(usersRepository.items[0].name).toBe('John Doe')
        expect(usersRepository.items[0].avatarUrl).toBe('https://example.com/avatar.jpg')
    })
})

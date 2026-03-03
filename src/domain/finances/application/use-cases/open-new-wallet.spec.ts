import { InMemoryMembersRepository } from 'test/unit/repositories/in-memory-members-repository'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { OpenWalletUseCase } from './open-new-wallet'
import { InMemoryWalletsRepository } from 'test/unit/repositories/in-memory-wallets-repository'
import { MemberAlreadyHasWalletError } from './errors/member-alredy-has-wallet-error'
import { makeMember } from 'test/unit/factories/make-member'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

let membersRepository: InMemoryMembersRepository
let walletsRepository: InMemoryWalletsRepository
let sut: OpenWalletUseCase

describe('Open new member wallet use case', () => {
  beforeEach(() => {
    membersRepository = new InMemoryMembersRepository()
    walletsRepository = new InMemoryWalletsRepository()

    sut = new OpenWalletUseCase(membersRepository, walletsRepository)
  })

  it('should be able to open a member wallet with initial balance', async () => {
    const member = await makeMember({}, new UniqueEntityID('member-1'))

    membersRepository.items.push(member)

    const result = await sut.execute({
      memberId: 'member-1',
      initialBalance: 250,
    })

    expect(result.isRight()).toBe(true)


    if (result.isRight()) {
      expect(result.value.wallet.balance).toBe(250)
      expect(result.value.wallet.holderId.toString()).toBe('member-1')
    }
  })

  it('should not be able to open a wallet of a member that does not exist', async () => {
    const result = await sut.execute({
      memberId: 'non-existing-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to open account of a member already has account', async () => {
    const member = await makeMember({}, new UniqueEntityID('member-1'))

    membersRepository.items.push(member)

    await sut.execute({
      memberId: 'member-1',
    })

    const result = await sut.execute({
      memberId: 'member-1',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(MemberAlreadyHasWalletError)
  })
})

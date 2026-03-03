import { Member } from '../../enterprise/entities/member'

export abstract class MembersRepository {
  abstract findById(id: string): Promise<Member | null>
}

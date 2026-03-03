import { Wallet } from '../../enterprise/entities/wallet'

export abstract class WalletsRepository {
  abstract create(wallet: Wallet): Promise<void>
  abstract findById(id: string): Promise<Wallet | null>
  abstract findByHolderId(holderId: string): Promise<Wallet | null>
  abstract save(wallet: Wallet): Promise<Wallet>
  abstract delete(wallet: Wallet): Promise<void>
}
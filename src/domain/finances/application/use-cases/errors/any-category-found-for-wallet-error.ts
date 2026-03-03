import { UseCaseError } from '@/core/types/errors/use-case-error'

export class AnyCategoryFoundForWalletError
  extends Error
  implements UseCaseError {
  constructor() {
    super('Any category was found for this wallet!')
  }
}

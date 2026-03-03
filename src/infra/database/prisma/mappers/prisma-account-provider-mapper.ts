import { AccountProvider } from "@prisma/client"

export class PrismaAccountProviderMapper {
  static toPrisma(provider: string): AccountProvider {
    const map: Record<string, AccountProvider> = {
      github: AccountProvider.GITHUB,
    }

    const prismaProvider = map[provider.toLowerCase()]

    if (!prismaProvider) {
      throw new Error(`Invalid  account provider: ${provider}`)
    }

    return prismaProvider
  }

  static toDomain(provider: AccountProvider): string {
    const map: Record<AccountProvider, string> = {
      [AccountProvider.GITHUB]: 'github',
    }

    const domainProvider = map[provider]

    if (!domainProvider) {
      throw new Error(`Unknown Prisma provider: ${provider}`)
    }

    return domainProvider
  }
}
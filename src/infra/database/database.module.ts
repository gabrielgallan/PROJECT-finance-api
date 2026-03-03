/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PrismaMembersRepository } from './prisma/repositories/prisma-members-repository';
import { PrismaWalletsRepository } from './prisma/repositories/prisma-wallets-repository';
import { PrismaCategoriesRepository } from './prisma/repositories/prisma-categories-repository';
import { PrismaTransactionsRepository } from './prisma/repositories/prisma-transactions-repository';
import { MembersRepository } from '@/domain/finances/application/repositories/members-repository';
import { WalletsRepository } from '@/domain/finances/application/repositories/wallets-repository';
import { CategoriesRepository } from '@/domain/finances/application/repositories/categories-repository';
import { TransactionsRepository } from '@/domain/finances/application/repositories/transactions-repository';
import { UsersRepository } from '@/domain/identity/application/repositories/users-repository';
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository';
import { PrismaAccountsRepository } from './prisma/repositories/prisma-accounts-repository';
import { AccountRepository } from '@/domain/identity/application/repositories/account-repository';
import { TokensRepository } from '@/domain/identity/application/repositories/tokens-repository';
import { PrismaTokensRepository } from './prisma/repositories/prisma-tokens-repository';

@Module({
    providers: [
        PrismaService,
        {
            provide: MembersRepository,
            useClass: PrismaMembersRepository
        },
        {
            provide: WalletsRepository,
            useClass: PrismaWalletsRepository
        },
        {
            provide: CategoriesRepository,
            useClass: PrismaCategoriesRepository
        },
        {
            provide: TransactionsRepository,
            useClass: PrismaTransactionsRepository
        },
        {
            provide: UsersRepository,
            useClass: PrismaUsersRepository
        },
        {
            provide: AccountRepository,
            useClass: PrismaAccountsRepository
        },
        {
            provide: TokensRepository,
            useClass: PrismaTokensRepository
        }
    ],
    exports: [
        PrismaService,
        MembersRepository,
        WalletsRepository,
        CategoriesRepository,
        TransactionsRepository,
        UsersRepository,
        AccountRepository,
        TokensRepository
    ],
})
export class DatabaseModule { }

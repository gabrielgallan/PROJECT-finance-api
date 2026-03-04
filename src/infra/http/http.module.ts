/*
https://docs.nestjs.com/modules
*/

// modules
import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { DatabaseModule } from '../database/database.module'

// controllers
import { RegisterController } from './controllers/authentication/register.controller'
import { AuthenticateController } from './controllers/authentication/authenticate.controller'
import { GetProfileController } from './controllers/profile/get-profile.controller'
import { OpenWalletController } from './controllers/wallet/open-new-wallet.controller'
import { CategoryController } from './controllers/category/category.controller'
import { GetRollingYearProgressController } from './controllers/summary/get-rolling-year-progress.controller'
import { AuthenticateWithGithubController } from './controllers/authentication/authenticate-with-github.controller'
import { RequestPasswordRecoverController } from './controllers/authentication/request-password-recover.controller'
import { GetSummariesByCategoriesController } from './controllers/summary/get-summaries-by-categories.controller'
import { ResetPasswordController } from './controllers/authentication/reset-password.controller'
import { CreateTransactionController } from './controllers/transactions/create-transaction.controller'
import { ListWalletTransactionsController } from './controllers/transactions/list-transactions.controller'
import { UploadAvatarController } from './controllers/profile/upload-avatar.controller'
import { EditWalletTransactionController } from './controllers/transactions/edit-transaction.controller'
import { GetWalletSummaryController } from './controllers/summary/get-summary.controller'
import { GetWalletInfoController } from './controllers/wallet/get-info.controller'

// use-cases
import { OpenWalletUseCase } from '@/domain/finances/application/use-cases/open-new-wallet'
import { CreateWalletCategoryUseCase } from '@/domain/finances/application/use-cases/create-wallet-category'
import { ListWalletCategoriesUseCase } from '@/domain/finances/application/use-cases/list-wallet-categories'
import { EditWalletCategoryUseCase } from '@/domain/finances/application/use-cases/edit-wallet-category'
import { CreateTransactionUseCase } from '@/domain/finances/application/use-cases/create-transaction'
import { ListWalletTransactionsUseCase } from '@/domain/finances/application/use-cases/list-wallet-transactions'
import { EditTransactionUseCase } from '@/domain/finances/application/use-cases/edit-transaction'
import { GetWalletSummaryUseCase } from '@/domain/finances/application/use-cases/get-wallet-summary'
import { GetWalletSummariesByCategoriesUseCase } from '@/domain/finances/application/use-cases/get-wallet-summaries-by-categories'
import { FinancialAnalyticsService } from '@/domain/finances/application/services/analytics/financial-analytics-service'
import { GetRollingYearProgressUseCase } from '@/domain/finances/application/use-cases/get-rolling-yearly-progress'
import { EnvModule } from '../env/env.module'
import { EmailModule } from '../email/email.module'
import { RegisterUseCase } from '@/domain/identity/application/use-cases/register'
import { AuthenticateUseCase } from '@/domain/identity/application/use-cases/authenticate'
import { GetProfileUseCase } from '@/domain/identity/application/use-cases/get-profile'
import { ResetPasswordUseCase } from '@/domain/identity/application/use-cases/reset-password'
import { RequestPasswordRecoverUseCase } from '@/domain/identity/application/use-cases/request-password-recover'
import { AuthenticateWithProviderUseCase } from '@/domain/identity/application/use-cases/authenticate-with-provider'
import { StorageModule } from '../storage/storage.module'
import { UploadAvatarUseCase } from '@/domain/identity/application/use-cases/upload-avatar'
import { GetWalletInfoUseCase } from '@/domain/finances/application/use-cases/get-wallet-info'

@Module({
    imports: [
        AuthModule,
        DatabaseModule,
        EnvModule,
        EmailModule,
        StorageModule
    ],
    controllers: [
        RegisterController,
        AuthenticateController,
        AuthenticateWithGithubController,
        GetProfileController,
        UploadAvatarController,
        RequestPasswordRecoverController,
        ResetPasswordController,
        OpenWalletController,
        CategoryController,
        CreateTransactionController,
        ListWalletTransactionsController,
        EditWalletTransactionController,
        GetWalletSummaryController,
        GetSummariesByCategoriesController,
        GetRollingYearProgressController,
        GetWalletInfoController
    ],
    providers: [
        RegisterUseCase,
        AuthenticateUseCase,
        AuthenticateWithProviderUseCase,
        GetProfileUseCase,
        UploadAvatarUseCase,
        ResetPasswordUseCase,
        RequestPasswordRecoverUseCase,
        OpenWalletUseCase,
        CreateWalletCategoryUseCase,
        ListWalletCategoriesUseCase,
        EditWalletCategoryUseCase,
        CreateTransactionUseCase,
        ListWalletTransactionsUseCase,
        EditTransactionUseCase,
        GetWalletSummaryUseCase,
        GetWalletSummariesByCategoriesUseCase,
        GetRollingYearProgressUseCase,
        FinancialAnalyticsService,
        GetWalletInfoUseCase
    ]
})
export class HttpModule { }

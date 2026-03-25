import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { SentryModule } from '@sentry/nestjs/setup'
import { AllExceptionsFilter } from '../http/filters/all-exceptions.filter'

@Module({
    imports: [SentryModule.forRoot()],
    providers: [
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        }
    ]
})
export class MonitoringModule { }

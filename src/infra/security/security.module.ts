import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EnvModule } from '../env/env.module';
import { EnvService } from '../env/env.service';

@Module({
    imports: [
        EnvModule,
        ThrottlerModule.forRootAsync({
            imports: [EnvModule],
            inject: [EnvService],
            useFactory: (env: EnvService) => [
                {
                    ttl: env.get('NODE_ENV') === 'test' ? 10000 : 60000,
                    limit: env.get('NODE_ENV') === 'test' ? 5 : 100,
                },
            ],
        }),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class SecurityModule { }
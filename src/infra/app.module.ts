import { HttpModule } from './http/http.module';
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env/env'
import { AuthModule } from './auth/auth.module'
import { EnvModule } from './env/env.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    EnvModule,
    AuthModule,
    HttpModule,
    SecurityModule,
    ConfigModule.forRoot({
      validate: env => envSchema.parse(env),
      isGlobal: true
    })
  ]
})
export class AppModule { }

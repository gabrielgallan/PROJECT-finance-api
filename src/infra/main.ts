import "./monitoring/monitoring.bootstrap"

import { NestFactory } from '@nestjs/core'
import { AppModule } from '@/infra/app.module'
import { EnvService } from './env/env.service'
import { Logger } from "@nestjs/common"

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { apiReference } from '@scalar/nestjs-api-reference'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['warn', 'error', 'log']
  })

  const config = new DocumentBuilder()
    .setTitle('Valora API')
    .setDescription('Finance manager API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()


  const logger = new Logger()

  const document = SwaggerModule.createDocument(app, config)

  app.use('/reference',
      apiReference({
        content: document,
        theme: 'elysiajs'
      })
  )

  const envService = app.get(EnvService)

  const port = envService.get('PORT')

  app.listen(port)
    .catch((err) => {
      logger.error("Error running HTTP server", err);

      process.exit(1)
    })
    .finally(() => {
      logger.log(`Server HTTP running on port ${port}`);
    })
}

void bootstrap()

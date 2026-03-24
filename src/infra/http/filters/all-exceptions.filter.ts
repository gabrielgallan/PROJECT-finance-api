import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common'
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { SentryExceptionCaptured } from '@sentry/nestjs'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name)

    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    @SentryExceptionCaptured()
    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost
        const ctx = host.switchToHttp()
        const request = ctx.getRequest()

        const statusCode =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR

        const defaultMessage =
            statusCode === 500
                ? 'Internal server error'
                : 'Request failed'

        const response =
            exception instanceof HttpException
                ? exception.getResponse()
                : null

        const message = this.getMessage(response, defaultMessage)

        const error =
            exception instanceof HttpException
                ? exception.name
                : 'InternalServerError'

        if (statusCode >= 500) {
            this.logger.error(`${request.method} ${request.url} ${statusCode} - ${Array.isArray(message) ? message.join(', ') : message}`, exception instanceof Error ? exception.stack : undefined)
        } else {
            this.logger.warn(`${request.method} ${request.url} ${statusCode} - ${Array.isArray(message) ? message.join(', ') : message}`)
        }

        const body = {
            statusCode,
            message,
            error,
        }

        httpAdapter.reply(ctx.getResponse(), body, statusCode)
    }

    private getMessage(response: unknown, fallback: string): string | string[] {
        if (!response) {
            return fallback
        }

        if (typeof response === 'string') {
            return response
        }

        if (typeof response === 'object' && response && 'message' in response) {
            const { message } = response as { message?: unknown }

            if (typeof message === 'string' || Array.isArray(message)) {
                return message
            }
        }

        return fallback
    }
}

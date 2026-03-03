import { Injectable } from '@nestjs/common'
import { EmailSender } from '@/domain/identity/application/email/email-sender'
import { EnvService } from '@/infra/env/env.service'
import { Resend } from 'resend'
import { recoveryCodeEmail } from '../templates/recovery-code-email'

@Injectable()
export class ResendEmailSenderService implements EmailSender {
    private resend: Resend

    constructor(private env: EnvService) {
        this.resend = new Resend(env.get('RESEND_API_KEY'))
    }

    async sendRecoveryCode(to: string, code: string) {
        const recoverUrl = `${this.env.get('FRONTEND_BASE_URL')}/auth/reset-password?code=${code}`

        const { subject, text, html } = recoveryCodeEmail(recoverUrl)

        const { error } = await this.resend.emails.send({
            from: `"Smart Finance" <onboarding@resend.dev>`,
            to,
            subject,
            text,
            html
        })

        if (error) {
            console.error(error)
        }
    }
}
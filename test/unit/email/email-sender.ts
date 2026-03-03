import { EmailSender } from "@/domain/identity/application/email/email-sender";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EmailSenderMock extends EmailSender {
    public emails: { to: string; subject: string; text: string }[] = []

    sendRecoveryCode(to: string, code: string) {
        this.emails.push({ to, subject: "Recovery Code", text: `Your recovery code is: ${code}` })

        return Promise.resolve()
    }
}
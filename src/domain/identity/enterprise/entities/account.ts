import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

interface AccountProps {
    userId: UniqueEntityID
    provider: string
    providerUserId?: string | null
}

export class Account extends Entity<AccountProps> {
    static create(
        props: AccountProps,
        id?: UniqueEntityID,
    ) {
        const account = new Account(
            props,
            id
        )

        return account
    }

    get userId() {
        return this.props.userId
    }

    get provider() {
        return this.props.provider
    }

    get providerUserId() {
        return this.props.providerUserId
    }
}
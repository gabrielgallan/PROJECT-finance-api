import { AuthProvider, UserProps } from "@/domain/identity/application/auth/auth-provider";
import { Injectable } from "@nestjs/common";

interface GithubOAuthProviderInputMock {
    OAuthCode: string
}

type GithubUserMock = UserProps

@Injectable()
export class GithubOAuthProviderMock implements AuthProvider<
    GithubUserMock,
    GithubOAuthProviderInputMock
> {
    async signIn({ OAuthCode }: GithubOAuthProviderInputMock) {
        return {
            id: `fake-id-user-${OAuthCode}`,
            name: 'John Doe',
            email: 'johndoe@email.com',
            avatarUrl: null
        }
    }
}
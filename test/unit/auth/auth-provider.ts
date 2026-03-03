import { AuthProvider, UserProps } from "@/domain/identity/application/auth/auth-provider";

interface Props extends UserProps {
    code: string;
}

interface SignInData {
    code: string
}

export class AuthProviderStub extends AuthProvider<Props, SignInData> {
    async signIn({ code }: SignInData) {
        return {
            id: '-user-id',
            email: 'johndoe@example.com',
            name: 'John Doe',
            avatarUrl: 'https://example.com/avatar.jpg',
            code
        }
    }
}
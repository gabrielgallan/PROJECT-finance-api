import { ResourceNotFoundError } from "@/core/errors/resource-not-found-error";
import { Either, left, right } from "@/core/types/either";
import { Injectable } from "@nestjs/common";
import { User } from "../../enterprise/entities/user";
import { UsersRepository } from "../repositories/users-repository";

interface EditProfileUseCaseRequest {
  userId: string;
  name?: string;
}

type EditProfileUseCaseResponse = Either<ResourceNotFoundError, { user: User }>;

@Injectable()
export class EditProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    name,
  }: EditProfileUseCaseRequest): Promise<EditProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new ResourceNotFoundError());
    }

    if (name) {
      user.name = name;
    }

    await this.usersRepository.save(user);

    return right({
      user,
    });
  }
}

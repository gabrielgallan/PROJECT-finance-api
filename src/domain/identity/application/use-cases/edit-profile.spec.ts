import { UniqueEntityID } from "@/core/entities/unique-entity-id";
import { InMemoryUsersRepository } from "test/unit/repositories/in-memory-users-repository";
import { makeUser } from "test/unit/factories/make-user";
import { EditProfileUseCase } from "./edit-profile";

let usersRepository: InMemoryUsersRepository;
let sut: EditProfileUseCase;

describe("Edit profile use case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    sut = new EditProfileUseCase(usersRepository);
  });

  it("should be able to edit profile", async () => {
    await usersRepository.create(
      await makeUser(
        {
          name: "John Doe",
        },
        new UniqueEntityID("user-1"),
      ),
    );

    const result = await sut.execute({
      userId: "user-1",
      name: "Peter John",
    });

    expect(result.isRight()).toBe(true);
    expect(result.value.user.name).toBe("Peter John");
    expect(usersRepository.items[0].name).toBe("Peter John");
  });
});

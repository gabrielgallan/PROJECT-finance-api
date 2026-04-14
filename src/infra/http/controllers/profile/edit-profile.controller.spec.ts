import request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "@/infra/app.module";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { Encrypter } from "@/domain/identity/application/cryptography/encrypter";

describe("Edit member profile tests", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let encrypter: Encrypter;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    encrypter = moduleRef.get(Encrypter);

    await app.init();
  });

  it("[PUT] /api/profile", async () => {
    const user = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "johndoe@email.com",
      },
    });

    const token = await encrypter.encrypt({ sub: user.id });

    const response = await request(app.getHttpServer())
      .put("/api/profile")
      .send({ name: "Jane Doe" })
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updatedUser?.name).toBe("Jane Doe");
  });

  afterAll(async () => {
    await app.close();
  });
});

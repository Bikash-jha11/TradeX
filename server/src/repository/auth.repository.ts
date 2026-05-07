import { User } from "@/types/types/types.common";
import prisma from "config/prisma.config";

export class AuthRepository {
  async create({ username, password }: User) {
    try {
      const user = await prisma.user.create({
        data: {
          username: username,
          password: password,
        },
      });
      return user;
    } catch (error) {
      return error;
    }
  }

  async findOne({ username }: Omit<User, "password">) {
    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });
      return user;
    } catch (error) {
      return error;
    }
  }
}

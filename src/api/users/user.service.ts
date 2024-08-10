import argon2 from "argon2";
import { IUserDTO, IUserFilters, IUserSignupDTO } from "./user.model";
import { prisma } from "../../../prisma/prismaClient";

export class UserService {
  async create(userData: IUserSignupDTO): Promise<IUserDTO> {
    const { password, email, username, imgUrl } = userData;
    const hashedPassword = await argon2.hash(password);
    const newUser = await prisma.user.create({
      data: {
        password: hashedPassword,
        email,
        username,
        imgUrl,
      },
    });

    return newUser;
  }
  async getById(userId: string): Promise<IUserDTO | null> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  }
  async getByUsername(username: string): Promise<IUserDTO | null> {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    return user;
  }
  async getByEmail(email: string): Promise<IUserDTO | null> {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    return user;
  }
  async update(
    id: string,
    userData: Partial<IUserDTO>
  ): Promise<IUserDTO | null> {
    const user = await prisma.user.update({
      where: {
        id: id,
      },
      data: userData,
    });

    return user;
  }
  async remove(id: string): Promise<boolean> {
    await prisma.user.delete({
      where: {
        id: id,
      },
    });

    return true;
  }
  async query(
    filters: IUserFilters = {}
  ): Promise<{ users: IUserDTO[]; total: number }> {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          filters.email ? { email: filters.email } : undefined,
          filters.username ? { username: filters.username } : undefined,
        ].filter(Boolean) as any,
      },
    });
    return { users, total: users.length };
  }
  async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return argon2.verify(hashedPassword, plainTextPassword);
  }
}

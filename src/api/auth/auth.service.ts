import jwt from "jsonwebtoken";
import {
  IUser,
  IUserDTO,
  IUserLoginDTO,
  IUserSignupDTO,
} from "../users/user.model";
import { UserService } from "../users/user.service";
import argon2 from "argon2";

const JWT_SECRET = process.env.JWT_SECRET!;
const userService = new UserService();
export class AuthService {
  async signUp(
    userData: IUserSignupDTO
  ): Promise<{ user: IUser; token: string }> {
    const user = await userService.create(userData);
    delete user.password;
    if (!user.id) throw new Error("Error creating user no id generated");
    const token = this.#generateToken(user.id);
    return { user, token };
  }

  async login(
    userData: IUserLoginDTO
  ): Promise<{ user: IUser; token: string } | null> {
    const { email, password } = userData;
    const user = await userService.getByEmail(email);
    if (!user || !user?.id) return null;
    const isPasswordValid = await this.#verifyPassword(
      password,
      user.password!
    );
    if (!isPasswordValid) return null;
    delete user.password;
    const token = this.#generateToken(user.id);
    return { user, token };
  }

  async validateToken(token: string): Promise<IUserDTO | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await userService.getById(decoded.userId);
      delete user?.password;
      return user;
    } catch (error) {
      return null;
    }
  }

  #generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1d" });
  }

  async #verifyPassword(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return argon2.verify(hashedPassword, plainTextPassword);
  }
}

export const authService = new AuthService();

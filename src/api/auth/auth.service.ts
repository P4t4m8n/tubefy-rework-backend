import jwt from "jsonwebtoken";
import {
  IUser,
  IUserDTO,
  IUserLoginDTO,
  IUserSignupDTO,
} from "../users/user.model";
import { UserService } from "../users/user.service";

const JWT_SECRET = process.env.JWT_SECRET!;
const userService = new UserService();
export class AuthService {
  async signUp(
    userData: IUserSignupDTO
  ): Promise<{ user: IUser; token: string }> {
    const usernameCheck = await userService.getByUsername(
      userData.username
    );
    if (usernameCheck) {
      throw new Error("Username already exists");
    }
    const emailCheck = await userService.getByEmail(userData.email);
    if (emailCheck) {
      throw new Error("Email already exists");
    }
    
    const newUser = await userService.create(userData);
    delete newUser.password;
    const token = this.#generateToken(newUser);
    return { user: newUser, token };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: IUserLoginDTO; token: string } | null> {
    const user = await userService.getByEmail(email);
    if (!user) return null;
    const isPasswordValid = await userService.verifyPassword(
      password,
      user.password!
    );
    if (!isPasswordValid) return null;
    delete user.password;
    const token = this.#generateToken(user);
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

  #generateToken(user: IUserDTO): string {
    return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });
  }
}

export const authService = new AuthService();

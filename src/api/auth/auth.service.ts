import jwt from "jsonwebtoken";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { IUser } from "../users/user.model";
import { UserService } from "../users/user.service";

const JWT_SECRET = process.env.JWT_SECRET!;
const userService = new UserService();
export class AuthService {
  async signUp(
    userData: Omit<IUser, "id" | "isAdmin">
  ): Promise<{ user: IUser; token: string }> {
    const newUser = await userService.createUser(userData);

    const token = this.generateToken(newUser);
    return { user: newUser, token };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string } | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user) return null;

    const isPasswordValid = await userService.verifyPassword(
      user.password,
      password
    );

    if (!isPasswordValid) return null;

    const token = this.generateToken(user);
    return { user, token };
  }

  generateToken(user: IUser): string {
    return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });
  }

  async validateToken(token: string): Promise<IUser | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await userService.getUserById(decoded.userId);
      return user;
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();

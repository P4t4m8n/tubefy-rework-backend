import { asyncLocalStorage } from "../../middlewares/setupALs.middleware";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";

const authService = new AuthService();

const TOKEN_EXPIRY = 1000 * 60 * 60 * 24; // 1 day

export const signUp = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: "Missing required fields" });
    }

    const result = await authService.signUp({
      username,
      email,
      password,
      avatarUrl: "",
    });
    res.cookie("loginToken", result.token, {
      httpOnly: true,
      maxAge: TOKEN_EXPIRY,
    });
    res.status(201).json({ user: result.user });
  } catch (error) {
    res.status(400).json({ message: "Failed to sign up", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Missing required fields" });
    }

    const result = await authService.login(email, password);
    if (result) {
      res.cookie("loginToken", result.token, {
        httpOnly: true,
        maxAge: TOKEN_EXPIRY,
      });
      res.json({ user: result.user });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to login", error });
  }
};

export const logout = async (req: Request, res: Response) => {
  
  console.log("logout:", logout)
  res.clearCookie("loginToken");
  // Clear the logged-in user from AsyncLocalStorage
  const store = asyncLocalStorage.getStore();
  console.log("store:", store)
  if (store) {
    store.loggedinUser = undefined;
  }

  res.json({ message: "Logged out successfully" });
};

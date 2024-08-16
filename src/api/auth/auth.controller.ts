import { asyncLocalStorage } from "../../middlewares/setupALs.middleware";
import { PlaylistService } from "../playlists/playlist.service";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";

const authService = new AuthService();

const TOKEN_EXPIRY = 1000 * 60 * 60 * 24; // 1 day

export const signUp = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      let missingFields = [];
      if (!username) missingFields.push("username");
      if (!email) missingFields.push("email");
      if (!password) missingFields.push("password");
      return res
        .status(400)
        .json({ message: `Missing fields: ${missingFields.join(",")} ` });
    }

    const result = await authService.signUp({
      username,
      email,
      password,
    });

    const playlistService = new PlaylistService();
    await playlistService.createUserLikesPlaylist(result.user.id!);

    res.cookie("loginToken", result.token, {
      httpOnly: true,
      maxAge: TOKEN_EXPIRY,
    });
    return res.status(201).json({ user: result.user });
  } catch (error) {
    return res.status(400).json({ message: "Failed to sign up", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      let missingFields = [];
      if (!email) missingFields.push("email");
      if (!password) missingFields.push("password");

      return res
        .status(400)
        .json({ message: `Missing fields: ${missingFields.join(",")} ` });
    }

    const result = await authService.login(email, password);
    if (result) {
      res.cookie("loginToken", result.token, {
        httpOnly: true,
        maxAge: TOKEN_EXPIRY,
      });
      return res.json(result.user);
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Failed to login", error });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("loginToken");
  // Clear the logged-in user from AsyncLocalStorage
  const store = asyncLocalStorage.getStore();
  if (store) {
    store.loggedinUser = undefined;
  }

  return res.json({ message: "Logged out successfully" });
};

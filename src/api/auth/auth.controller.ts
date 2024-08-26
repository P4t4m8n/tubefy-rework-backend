import { asyncLocalStorage } from "../../middlewares/setupALs.middleware";
import { getDefaultLikesPlaylist } from "../../services/util";
import { playlistService } from "../playlists/playlist.service";
import { userService } from "../users/user.service";
import { authService } from "./auth.service";
import { Request, Response } from "express";

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
    
    const usernameCheck = await userService.getByUsername(username);
    if (usernameCheck) {
      return res.status(409).json({ message: "Username already exists" });
    }
    const emailCheck = await userService.getByEmail(email);
    if (emailCheck) {
      return res.status(409).json({ message: "Email already exists" });
    }
    
    const result = await authService.signUp({
      username,
      email,
      password,
    });

    const playlistToCreate = getDefaultLikesPlaylist(result.user.id!);
    const playlist = await playlistService.create(playlistToCreate, result.user);
    console.log("playlist:", playlist)

    const user = await userService.getDetailedUser(result.user);

    res.cookie("loginToken", result.token, {
      httpOnly: true,
      maxAge: TOKEN_EXPIRY,
    });
    return res.status(201).json(user);
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

    const result = await authService.login({ email, password });
    if (!result) {
      return res.status(409).json({ message: "Invalid Email or Password" });
    }

    const user = await userService.getDetailedUser(result.user);

    res.cookie("loginToken", result.token, {
      httpOnly: true,
      maxAge: TOKEN_EXPIRY,
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Failed to login", error });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("loginToken");
  const store = asyncLocalStorage.getStore();
  if (store) {
    store.loggedinUser = undefined;
  }

  return res.status(200).json({ message: "Logged out successfully" });
};

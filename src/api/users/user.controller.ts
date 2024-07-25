import { Request, Response } from "express";
import { IUser } from "./user.model";
import { UserService } from "./user.service";

const userService = new UserService();
export const createUser = async (req: Request, res: Response) => {
  try {
    const userData: IUser = req.body;

    if (!userData.email || !userData.password) {
      throw new Error("Email and password are required");
    }

    const existingUser = await userService.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const newUser = await userService.createUser(userData);

    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: "Failed to create user", error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "User ID is required" });
    }

    const user = await userService.getUserById(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve user", error });
  }
};

export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve user", error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userData: Partial<IUser> = req.body;

    if (!id) {
      res.status(400).json({ message: "User ID is required" });
    }

    const updatedUser = await userService.updateUser(id, userData);

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: "Failed to update user", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "User ID is required" });
    }

    const result = await userService.deleteUser(id);

    if (!result) {
      res.status(404).json({ message: "User not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const filters = {
      username: req.query.username as string | undefined,
      email: req.query.email as string | undefined,
      isAdmin:
        req.query.isAdmin === "true"
          ? true
          : req.query.isAdmin === "false"
          ? false
          : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    const { users, total } = await userService.getAllUsers(filters);

    res.json({
      users,
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve users", error });
  }
};

export const getDetailedUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "User ID is required" });
    }

    const user = await userService.getDetailedUser(id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve user", error });
  }
};

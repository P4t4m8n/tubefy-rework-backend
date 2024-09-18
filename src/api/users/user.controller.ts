import { Request, Response } from "express";
import { IUser, IUserDTO, IUserFilters, IUserSignupDTO } from "./user.model";
import { UserService } from "./user.service";
import { asyncLocalStorage } from "../../middlewares/setupALs.middleware";
import { loggerService } from "../../services/logger.service";

const userService = new UserService();

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData: IUserSignupDTO = req.body;

    if (!userData.email || !userData.password) {
      throw new Error("Email and password are required");
    }

    const existingUser = await userService.getByEmail(userData.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const newUser = await userService.create(userData);

    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(400).json({ message: "Failed to create user", error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const store = asyncLocalStorage.getStore();
    const id = store?.loggedinUser?.id;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await userService.getById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve user", error });
  }
};

export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await userService.getByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    delete user.password;

    return res.json(user);
  } catch (error) {
    loggerService.error(`Failed to retrieve user, ${error}`);
    return res.status(500).json({ message: "Failed to retrieve user", error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const store = asyncLocalStorage.getStore();

    const id = store?.loggedinUser?.id;
    const userData: IUserDTO = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (id !== userData.id) {
      return res
        .status(403)
        .json({ message: "You are not allowed to update this user" });
    }

    const updatedUser = await userService.update(id, userData);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(updatedUser);
  } catch (error) {
    loggerService.error(`Failed to update user, ${error}`);
    return res.status(500).json({ message: "Failed to update user", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const result = await userService.remove(id);

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete user", error });
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

    const users = await userService.query(filters);

    return res.json({
      users,
      total: users.length,
      page: filters.page || 1,
      limit: filters.limit || 10,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve users", error });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const store = asyncLocalStorage.getStore();
    const userId = store?.loggedinUser?.id;

    const { username, email } = req.query as IUserFilters;

    if (!username && !email) {
      return res.status(400).json({ message: "Username or email is required" });
    }

    const users = await userService.query({ username, email });

    if (!users) {
      return res.status(404).json({ message: "No users where found" });
    }

    if (userId) {
      const idx = users.findIndex((user) => user.id === userId);
      if (idx > -1) {
        users.splice(idx, 1);
      }
    }

    return res.status(200).json(users);
  } catch (error) {
    loggerService.error(`Failed to retrieve users, ${error}`);
    return res.status(500).json({ message: "Failed to retrieve users", error });
  }
};

import { and, eq, like, SQL, sql } from "drizzle-orm";

import argon2 from "argon2";
import { IDetailedUser, IUser, IUserFilters } from "./user.model";
import { db } from "../../db";
import { friends, playlists, songLikes, songs, users } from "../../db/schema";
import { IPlaylist } from "../playlists/playlist.model";
import { PlaylistType } from "../playlists/playlist.enum";

export class UserService {
  async createUser(userData: Omit<IUser, "id">): Promise<IUser> {
    const hashedPassword = await argon2.hash(userData.password!);
    const [newUser] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    return newUser;
  }

  async getUserById(id: string): Promise<IUser | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user || null;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user || null;
  }

  async updateUser(
    id: string,
    userData: Partial<IUser>
  ): Promise<IUser | null> {
    if (userData.password) {
      userData.password = await argon2.hash(userData.password);
    }
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    if (!result.rowCount) return false;
    return result.rowCount > 0;
  }

  async getAllUsers(
    filters: IUserFilters = {}
  ): Promise<{ users: IUser[]; total: number }> {
    const { username, email, isAdmin, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const whereConditions: SQL[] = [];

    if (username) {
      whereConditions.push(like(users.username, `%${username}%`));
    }

    if (email) {
      whereConditions.push(like(users.email, `%${email}%`));
    }

    if (isAdmin !== undefined) {
      whereConditions.push(eq(users.isAdmin, isAdmin));
    }

    const baseQuery = db.select().from(users);
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(users);

    if (whereConditions.length > 0) {
      const whereClause = and(...whereConditions);
      baseQuery.where(whereClause);
      countQuery.where(whereClause);
    }

    const query = baseQuery.limit(limit).offset(offset);

    const [usersResult, countResult] = await Promise.all([query, countQuery]);

    return {
      users: usersResult,
      total: Number(countResult[0].count),
    };
  }

  async getDetailedUser(id: string): Promise<IDetailedUser | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) return null;

    const userPlaylistsData = await db
      .select()
      .from(playlists)
      .where(eq(playlists.ownerId, id));

    const userPlaylists: IPlaylist[] = userPlaylistsData.map((playlist) => ({
      ...playlist,
      type: playlist.type as PlaylistType,
    }));

    const userFriends: IUser[] = await db
      .select({
        id: friends.friendId,
        username: users.username,
        avatarUrl: users.avatarUrl,
        email: users.email,
        isAdmin: users.isAdmin,
      })
      .from(friends)
      .innerJoin(users, eq(friends.friendId, users.id))
      .where(and(eq(friends.userId, id), eq(friends.status, "ACCEPTED")));

    return {
      ...user,
      playlists: userPlaylists,
      friends: userFriends,
    };
  }

  async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return argon2.verify(hashedPassword, plainTextPassword);
  }
}

import { FriendStatus, Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/prismaClient";
import { IFriend } from "./friends.model";
import { loggerService } from "../../services/logger.service";

export class FriendService {
  async query(
    userId: string,
    status: FriendStatus = "ACCEPTED"
  ): Promise<IFriend[]> {
    try {
      const friends = await prisma.friend.findMany({
        relationLoadStrategy: "join",
        where: {
          userId,
          status,
        },
        include: {
          friend: {
            select: {
              id: true,
              username: true,
              isAdmin: true,
              imgUrl: true,
            },
          },
        },
      });
      if (!friends) {
        return [];
      }
      return friends;
    } catch (error) {
      throw new Error(`Error while fetching friends: ${error}`);
    }
  }

  async get(userId: string, friendId: string): Promise<IFriend | null> {
    try {
      const friend = await prisma.friend.findFirst({
        relationLoadStrategy: "join",

        where: {
          userId,
          friendId,
        },
        include: {
          friend: {
            select: {
              id: true,
              username: true,
              isAdmin: true,
              imgUrl: true,
            },
          },
        },
      });

      return friend;
    } catch (error) {
      throw new Error(`Error while fetching friend: ${error}`);
    }
  }

  async create(userId: string, friendId: string): Promise<boolean> {
    try {
      const request = await prisma.friend.create({
        data: {
          userId,
          friendId,
          status: "PENDING",
        },
      });

      return !!request;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        // P2002 is the code for a unique constraint violation
        loggerService.error(
          `A friend request with the same userId and friendId already exists in the database ${error} userId: ${userId} friendId: ${friendId}`
        );
        return false;
      }
      throw new Error(`Error while creating friend request: ${error}`);
    }
  }

  async update(
    userId: string,
    friendId: string,
    status: FriendStatus
  ): Promise<boolean> {
    try {
      const request = await prisma.friend.updateMany({
        where: {
          userId,
          friendId,
        },
        data: {
          status,
        },
      });

      return request.count > 0;
    } catch (error) {
      throw new Error(`Error while accepting friend request: ${error}`);
    }
  }
}

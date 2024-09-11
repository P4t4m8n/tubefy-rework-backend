import { FriendStatus, Prisma } from "@prisma/client";
import { prisma } from "../../../prisma/prismaClient";
import { IFriend, IFriendRequestData } from "./friends.model";
import { IUser } from "../users/user.model";
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

  async create(userId: string, friendId: string): Promise<IFriend> {
    try {
      const friendData = await prisma.friend.create({
        relationLoadStrategy: "join",
        data: {
          userId,
          friendId,
          status: "PENDING",
        },
        select: {
          id: true,
          createdAt: true,
          status: true,
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

      const friend: IFriend = {
        id: friendData.id,
        createdAt: friendData.createdAt,
        status: friendData.status,
        friend: friendData.friend,
      };

      return friend;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        //code for a unique constraint violation
        throw new Error("Friend request already exists");
      }
      throw new Error(`Error while creating friend request: ${error}`);
    }
  }

  async update(id: string, status: FriendStatus) {
    const friend = await prisma.friend.update({
      where: {
        id,
      },
      data: {
        status,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        friend: {
          select: {
            id: true,
            username: true,
            isAdmin: true,
            imgUrl: true,
          },
        },
        user: {
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
  }

  async remove(id: string): Promise<IFriend> {
    try {
      const friend = await prisma.friend.delete({
        where: {
          id,
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          friend: {
            select: {
              id: true,
              username: true,
              imgUrl: true,
            },
          },
        },
      });

      return friend;
    } catch (error) {
      throw new Error(`Error while removing friend: ${error}`);
    }
  }

  categorizeFriendsByStatus(friendsRequestData: IFriendRequestData[]): {
    friends: IFriend[];
    friendsRequest: IFriend[];
  } {
    const result = {
      friends: [] as IFriend[],
      friendsRequest: [] as IFriend[],
    };

    friendsRequestData.forEach((friend) => {
      friend.friend = friend.user!;
      delete friend?.user;
      if (friend.status === "ACCEPTED") {
        result.friends.push(friend);
      } else if (friend.status === "PENDING") {
        result.friendsRequest.push(friend);
      }
    });

    return result;
  }
}

export const friendService = new FriendService();

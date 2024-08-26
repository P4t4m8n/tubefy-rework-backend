import { FriendStatus } from "@prisma/client";
import { IUser } from "../users/user.model";

export interface IFriend {
  id: string;
  createdAt: Date;
  status: FriendStatus;
  friend: IUser;
}

export interface IFriendDTO {
  userId: string;
  friendId: string;
  id: string;
  status: FriendStatus;
}

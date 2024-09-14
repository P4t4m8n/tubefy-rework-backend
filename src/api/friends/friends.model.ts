import { FriendStatus } from "@prisma/client";
import { IUser } from "../users/user.model";

export interface IFriend {
  id: string;
  createdAt: Date;
  status: FriendStatus;
  friend: IUser;
}
export interface IFriendRequestData extends IFriend {
  user?: IUser;
}

export interface IFriend {
  id: number;
  userId: number;
  friendId: number;
  createdAt: Date;
  status: FriendStatus;
}

export enum FriendStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  BLOCKED = "BLOCKED",
  REJECTED = "REJECTED",
}

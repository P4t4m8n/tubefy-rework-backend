import { IFriendSqlLogic } from "./friends.SqlLogic.model";

export const friendSqlLogic: IFriendSqlLogic = {
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
  },
};

import { IUserSqlLogic } from "./userSqlLogic.model";

export const userSqlLogic:IUserSqlLogic = {
  select: {
    id: true,
    username: true,
    imgUrl: true,
  },
};

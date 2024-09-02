import { IUserSqlLogic } from "../users/userSqlLogic.model";

export interface IShareSelectSqlLogic {
  id: boolean;
  playlistId: boolean;
  isOpen: boolean;
  user: IUserSqlLogic;
}

export interface IPlaylistSmallSqlLogic {
  select: {
    id: boolean;
    name: boolean;
    imgUrl: boolean;
    isPublic: boolean;
    itemType: boolean;
  };
}

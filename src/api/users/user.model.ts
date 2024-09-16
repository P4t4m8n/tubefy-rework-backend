import { IFriend } from "../friends/friends.model";
import { INotification } from "../notification/notification.model";
import { IPlaylist } from "../playlists/playlist.model";

export interface IUser {
  id?: string;
  imgUrl?: string | null;
  isAdmin?: boolean;
  username: string;
}
export interface IUserDetailed extends IUser {
  password?: string;
  email: string;
}
export interface IFullUser {
  friends: IFriend[];
  friendsRequest: IFriend[];
  likedSongsPlaylist: IPlaylist;
  playlists: IPlaylist[];
  user: IUserDetailed;
  notifications: INotification[];
}
export interface IUserFilters {
  username?: string;
  email?: string;
}
export interface IUserLoginDTO {
  password: string;
  email: string;
}
export interface IUserSignupDTO {
  password: string;
  email: string;
  username: string;
  imgUrl?: string;
}
export interface IUserDTO {
  username: string;
  email: string;
  password?: string;
  imgUrl?: string | null | undefined;
  isAdmin?: boolean;
  id?: string;
}

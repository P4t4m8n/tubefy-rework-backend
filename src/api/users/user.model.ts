import { IPlaylist } from "../playlists/playlist.model";
import { ISongLike } from "../songs/songLike.model";

export interface IUser {
  username: string;
  password?: string;
  avatarUrl?: string|null;
  isAdmin?: boolean;
  email: string;
  id?: string;
}

export interface IDetailedUser extends IUser {
  playlists: IPlaylist[];
  friends: IUser[];
}



export interface IUserFilters {
  username?: string;
  email?: string;
  isAdmin?: boolean;
  page?: number;
  limit?: number;
}
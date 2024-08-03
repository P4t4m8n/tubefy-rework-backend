import { ISong } from "../songs/song.model";
import { IUser } from "../users/user.model";

export interface IPlaylist {
  id?: string;
  name: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: Date;
  imgUrl: string;
  isLikedByUser?: boolean;
}

export interface IPlaylistDTO {
  name: string;
  ownerId: string;
  isPublic: boolean;
  imgUrl: string;
}

export interface IDetailedPlaylist extends IPlaylist {
  songs: ISong[];
  shares: {
    count: number;
  };
  owner: IUser;
  duration: string;
}

export interface IPlaylistFilters {
  name?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  userId?: string;
}

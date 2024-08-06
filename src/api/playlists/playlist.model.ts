import { Genres } from "../songs/song.enum";
import { ISong } from "../songs/song.model";
import { IUser } from "../users/user.model";
import { PlaylistType } from "./playlist.enum";

export interface IPlaylist {
  id?: string;
  name: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: Date;
  imgUrl: string;
  isLikedByUser?: boolean;
  type: PlaylistType;
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
  limit?: number;
  ownerId?: string;
  artist?: string;
  genres?: Genres[];
  page?: number;
}

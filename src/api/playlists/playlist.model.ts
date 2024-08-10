import { Genres } from "../songs/song.enum";
import { ISong } from "../songs/song.model";
import { IUser } from "../users/user.model";
import { PlaylistType } from "./playlist.enum";

export interface IPlaylistCreateDTO {
  name: string;
  ownerId: string;
  isPublic: boolean;
  imgUrl: string;
}

export interface IPlaylistUpdateDTO extends IPlaylistCreateDTO {
  types: PlaylistType[];
  genres: Genres[];
}

export interface IPlaylist {
  id: string;
  name: string;
  
  imgUrl: string;
  songs: ISong[];
  genres: Genres[];
  isPublic: boolean;
  createdAt: Date;
  isLikedByUser?: boolean;
  types: PlaylistType[];
  owner: IUser;
  duration: string;
  shares: {
    count: number;
  };
}

export interface IPlaylistFilters {
  name?: string;
  isPublic?: boolean;
  limit?: number;
  ownerId?: string;
  artist?: string;
  genres?: Genres[];
  page?: number;
  isLikedByUser?: boolean;
}

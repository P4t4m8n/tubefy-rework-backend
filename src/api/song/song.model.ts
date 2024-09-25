import { IItemType } from "../../models/app.model";
import { TPlaylistType } from "../playlists/playlist.model";
import { IUser } from "../users/user.model";
import { EGenres } from "./song.enum";

export interface ISongSmall extends IItemType {
  id: string;
  youtubeId: string;
  name: string;
  imgUrl: string;
}
export interface ISong extends ISongSmall {
  isLikedByUser: boolean;
  genres: EGenres[];
  duration: string;
  artist: string;
  addedAt: Date;
  addedBy: IUser;
  playlistType?: TPlaylistType[];
}
export interface ISongDTO {
  name: string;
  artist: string;
  genres: EGenres[];
  playlistType: TPlaylistType[];
  duration: string;
  youtubeId: string;
  imgUrl: string;
  addByUserId: string;
  originCountry?: string;
  addedAt?: Date;
}
export interface ISongFilter {
  name?: string;
  artist?: string;
  genres?: EGenres[];
  limit?: number;
  offset?: number;
  addByUserId?: string;
  isLikedByUser?: boolean;
}
export interface ISongData {
  id: string;
  name: string;
  artist: string;
  imgUrl: string;
  duration: string;
  genres: string[];
  youtubeId: string;
  addedAt: Date;
  addedBy: {
    id: string;
    imgUrl: string | null;
    username: string;
  };
  songLikes?: {
    id: string;
  }[];
}

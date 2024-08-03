import { IUser } from "../users/user.model";
import { Genres } from "./song.enum";

export interface ISong {
  id: string;
  youtubeId: string;
  name: string;
  artist: string | null;
  thumbnail: string | null;
  duration: string | null;
  isLikeByUser?: boolean;
  genres: Genres[];
  addedAt: Date;
  addBy: IUser;
}

export interface IPlaylistSong {
  id: string;
  playlistId: number;
  songId: number;
  addedAt: Date;
}

export interface ISongDTO {
  youtubeId: string;
  name: string;
  artist: string | null;
  thumbnail: string | null;
  duration: string | null;
  addedAt: Date;
  addByUserId: string;
}

export interface ISongFilter {
  name?: string;
  artist?: string;
  genres?: Genres[];
  limit?: number;
  offset?: number;
  addByUserId?: string;
  userId?:string
}

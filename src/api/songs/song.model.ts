import { IUser } from "../users/user.model";
import { Genres } from "./song.enum";

export interface ISong {
  id: string;
  youtubeId: string;
  name: string;
  imgUrl: string;
  isLikeByUser: boolean;
  genres: Genres[];
  duration: string;
  artist: string;
  addedAt: Date;
  addBy: IUser;
}

export interface ISongDTO {
  youtubeId: string;
  name: string;
  artist: string;
  imgUrl: string;
  duration: string;
  addedAt?: Date;
  addByUserId: string;
  genres: Genres[];
}

export interface ISongFilter {
  name?: string;
  artist?: string;
  genres?: Genres[];
  limit?: number;
  offset?: number;
  addByUserId?: string;
  isLikedByUser?: boolean;
}

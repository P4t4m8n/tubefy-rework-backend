import { IItemType } from "../../models/app.model";
import { IUser } from "../users/user.model";
import { Genres } from "./song.enum";


export interface ISongSmall extends IItemType {
  id: string;
  youtubeId: string;
  name: string;
  imgUrl: string;
}
export interface ISong extends ISongSmall {
  id: string;
  youtubeId: string;
  name: string;
  imgUrl: string;
  isLikedByUser: boolean;
  genres: Genres[];
  duration: string;
  artist: string;
  addedAt: Date;
  addedBy: IUser;
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

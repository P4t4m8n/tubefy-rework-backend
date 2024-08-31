import { IItemType } from "../../models/app.model";
import { Genres } from "../songs/song.enum";
import { ISong } from "../songs/song.model";
import { IUser } from "../users/user.model";

export interface IPlaylistCreateDTO {
  name: string;
  ownerId: string;
  isPublic: boolean;
  imgUrl: string;
  description?: string | null;
  types: TPlaylistType[];
  genres: Genres[];
}
export interface IPlaylist extends IItemType {
  id: string;
  name: string;
  createdAt: Date;
  imgUrl: string;
  isPublic: boolean;
  owner: IUser;
  duration: string;
  types: TPlaylistType[];
  songs: ISong[];
  genres: Genres[];

  isLikedByUser?: boolean;
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

export type TPlaylistType =
  | "New Music"
  | "Daily mix"
  | "Chill"
  | "Workout"
  | "Party"
  | "Focus"
  | "Sleep"
  | "Travel"
  | "Kids"
  | "Cooking"
  | "Wellness"
  | "Study"
  | "Chill-out "
  | "New Wave"
  | ""
  | "Liked Songs";

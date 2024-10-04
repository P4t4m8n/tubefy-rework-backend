import { IItemType, TGenres } from "../../models/app.model";
import { ISong } from "../song/song.model";
import { IUser } from "../users/user.model";

export interface IPlaylistDTO {
  name: string;
  ownerId: string;
  isPublic: boolean;
  imgUrl: string;
  description?: string | null;
  type: TPlaylistType;
  genres: TGenres[];
  createdAt?: Date;
  id?: string;
  duration?: string;
  originCountry?: string;
}
export interface IPlaylistSmall extends IItemType {
  id: string;
  name: string;
  imgUrl: string;
  isPublic?: boolean;
}
export interface IPlaylist extends IPlaylistSmall {
  createdAt: Date;
  owner: IUser;
  duration: string;
  type: TPlaylistType;
  description?: string | null;
  songs: ISong[];
  genres: TGenres[];
  originCountry?: string;
  isLikedByUser?: boolean;
}
export interface IPlaylistFilters {
  name?: string;
  isPublic?: boolean;
  limit?: number;
  ownerId?: string;
  artist?: string;
  genres?: TGenres[];
  page?: number;
  isLikedByUser?: boolean;
  songName?: string;
  type?: TPlaylistType;
}

export interface IPlaylistsGroup {
  type: TPlaylistType | string;
  playlists: IPlaylist[];
}

export const PLAYLISTS_TYPES = [
  "New Music",
  "Chill",
  "Workout",
  "Party",
  "Sleep",
  "Travel",
  "Cooking",
  "Study",
  "New Wave",
  "Other",
  "Popular",
  "Charts",
  "Decades",
  "Mood",
  "Live",
  "Driving",
  "Coding",

  //User specific
  "Liked Songs",
  "User",
  "Friends",
] as const;

export type TPlaylistType = (typeof PLAYLISTS_TYPES)[number];

export interface IPlaylistShare {
  playlistId: string;
  user: IUser;
  isOpen: boolean;
}

import { IItemType } from "../../models/app.model";
import { EGenres } from "../song/song.enum";
import { ISong } from "../song/song.model";
import { IUser } from "../users/user.model";

export interface IPlaylistDTO {
  name: string;
  ownerId: string;
  isPublic: boolean;
  imgUrl: string;
  description?: string | null;
  type: TPlaylistType;
  genres: EGenres[];
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
  songs: ISong[];
  genres: EGenres[];
  originCountry?: string;
  isLikedByUser?: boolean;
}
export interface IPlaylistFilters {
  name?: string;
  isPublic?: boolean;
  limit?: number;
  ownerId?: string;
  artist?: string;
  genres?: EGenres[];
  page?: number;
  isLikedByUser?: boolean;
}

export interface IPlaylistsGroup {
  type: TPlaylistType | string;
  playlists: IPlaylist[];
}

export const PLAYLISTS_TYPES = [
  "New Music",
  "Daily Mix",
  "Chill",
  "Workout",
  "Party",
  "Focus",
  "Sleep",
  "Travel",
  "Kids",
  "Cooking",
  "Wellness",
  "Study",
  "New Wave",
  "",
  "Liked Songs",
  "Local Music",
  "Other",
  "Popular",
  "Charts",
  "Decades",
  "Mood",
  "Live",
  "User",
] as const;

export type TPlaylistType = (typeof PLAYLISTS_TYPES)[number];

export interface IPlaylistShare {
  playlistId: string;
  user: IUser;
  isOpen: boolean;
}

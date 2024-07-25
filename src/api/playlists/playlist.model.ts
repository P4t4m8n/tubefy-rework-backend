import { IUser } from "../users/user.model";

export interface IPlaylist {
  id: string;
  name: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: Date;
  imgUrl: string;
  likes?: {
    isLikedByUser: boolean;
  };
}

export interface IDetailedPlaylist extends IPlaylist {
  songs: {
    id: string;
    youtubeId: string;
    title: string;
    artist: string | null;
    thumbnail: string | null;
    duration: number | null;
    order: number;
    isLikedByUser: boolean;
  }[];

  shares: {
    count: number;
    sharedWith: IUser[];
  };
  owner: IUser;
}

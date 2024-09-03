import { NotificationType } from "@prisma/client";
import { IUser } from "../users/user.model";
import { IPlaylistSmall } from "../playlists/playlist.model";
import { ISongSmall } from "../songs/song.model";

export interface INotificationDTO {
  userId: string;
  fromUserId: string;
  type: NotificationType;
  text: string;
  playlistId?: string;
  songId?: string;
}

export interface INotification {
  imgUrl?: string;
  id: string;
  type: NotificationType;
  text: string;
  fromUser?: IUser;
  playlist?: IPlaylistSmall | null;
  song?: ISongSmall | null;
}

export interface INotificationData {
  id: string;
  type: string;
  text: string;
  fromUser: {
    id: string;
    imgUrl: string | null;
    username: string;
  };
  playlist?: {
    id: string;
    name: string;
    imgUrl: string;
    isPublic: boolean;
    itemType: "PLAYLIST";
  };
  song: {
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
      imgUrl: string;
      username: string;
    };
    songLikes: string[]; 
  };
}

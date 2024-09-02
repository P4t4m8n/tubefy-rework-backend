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
  id: string;
  type: NotificationType;
  text: string;
  fromUser?: IUser;
  playlist?: IPlaylistSmall | null;
  song?: ISongSmall | null;
}

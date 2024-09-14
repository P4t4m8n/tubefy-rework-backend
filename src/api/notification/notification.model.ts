import { NotificationType } from "@prisma/client";
import { IUser } from "../users/user.model";
import { IPlaylistSmall } from "../playlists/playlist.model";
import { ISongSmall } from "../song/song.model";
import { IFriend } from "../friends/friends.model";

export interface INotificationDTO {
  userId: string;
  fromUserId: string;
  type: NotificationType;
  text: string;
  playlistId?: string;
  songId?: string;
  friendId?: string;
}
export interface INotification {
  imgUrl?: string;
  id: string;
  type: NotificationType;
  text: string;
  fromUser?: IUser;
  playlist?: IPlaylistSmall | null;
  song?: ISongSmall | null;
  friend?: IFriend | null;
}

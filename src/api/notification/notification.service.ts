import { NotificationType } from "@prisma/client";
import { prisma } from "../../../prisma/prismaClient";
import { IPlaylistSmallSqlLogic } from "../playlists/sqlLogic.model";
import { ISongSqlLogic } from "../song/songSqlLogic.model";
import { INotification, INotificationDTO } from "./notification.model";
import { IUserSqlLogic } from "../users/userSqlLogic.model";
import { playlistSmallSqlLogic } from "../playlists/playlist.SqlLogic";
import { getSongSqlLogic } from "../song/songSqlLogic";
import { songService } from "../song/song.service";
import { ISongData } from "../song/song.model";

class NotificationService {
  async create(notificationDTO: INotificationDTO): Promise<INotification> {
    const extraData = this.#getExtraData(
      notificationDTO.type,
      notificationDTO.userId
    );

    const notificationData = await prisma.notification.create({
      data: notificationDTO,
      select: {
        id: true,
        type: true,
        text: true,
        ...extraData,
      },
    });
    const { id, type, text, fromUser } = notificationData;
    const notification: INotification = {
      id,
      type,
      text,
      fromUser,
      imgUrl: fromUser?.imgUrl || "/default-user.png",
    };

    if (notificationData?.playlist) {
      notification.playlist = notificationData.playlist;
      if (notification.playlist.imgUrl) {
        notification.imgUrl = notification.playlist.imgUrl;
      }
    }
    if (notificationData?.song) {
      const fixedSong = songService.songDataToSong(
        notificationData.song as unknown as ISongData
      );
      if (notificationData.song.imgUrl) {
        notification.imgUrl = notificationData.song.imgUrl;
      }

      notification.song = fixedSong;
    }

    return notification;
  }

  async createMany(notificationDTO: INotificationDTO[]) {
    const notifications = await prisma.notification.createMany({
      data: notificationDTO,
    });

    return notifications;
  }

  async query(userId: string): Promise<INotification[]> {
    const extraData = this.#getExtraData();

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        type: true,
        text: true,
        ...extraData,
      },
    });

    const fixedNotifications: INotification[] = notifications.map(
      (notification) => {
        switch (notification.type) {
          case "PLAYLIST_COMMENT":
          case "PLAYLIST_LIKE":
          case "PLAYLIST_SHARE":
            return {
              fromUser: notification.fromUser,
              playlist: notification.playlist,
              type: notification.type,
              id: notification.id,
              text: notification.text,
              imgUrl:
                notification.playlist?.imgUrl ||
                notification.fromUser?.imgUrl ||
                "/default-playlist.png",
            };
          case "SONG_LIKE":
          case "SONG_COMMENT":
            return {
              song: notification.song,
              fromUser: notification.fromUser,
              type: notification.type,
              id: notification.id,
              text: notification.text,
              imgUrl:
                notification.song?.imgUrl ||
                notification.fromUser?.imgUrl ||
                "/default-song.png",
            };
          default:
            return {
              fromUser: notification.fromUser,
              type: notification.type,
              id: notification.id,
              text: notification.text,
              imgUrl: notification.fromUser?.imgUrl || "/default-user.png",
            };
        }
      }
    );

    return fixedNotifications;
  }

  async get(id: string) {
    const notification = await prisma.notification.findUnique({
      where: {
        id,
      },
    });

    return notification;
  }

  async remove({
    notificationId,
    playlistId,
    userId,
    songId,
  }: {
    notificationId: string;
    playlistId?: string;
    songId?: string;
    userId?: string;
  }) {
    if (!notificationId && !(playlistId && userId)) {
      throw new Error("You must provide an id or playlistId and userId");
    }
    
    
    await prisma.notification.delete({
      where: {
        id: notificationId,
        playlistId,
        userId,
        songId,
      },
    });
  }

  mapNotificationsDataToNotifications(notificationsData: INotification[]) {
    const fixedNotifications: INotification[] = notificationsData.map(
      (notification) => {
        switch (notification!.type) {
          case "PLAYLIST_COMMENT":
          case "PLAYLIST_LIKE":
          case "PLAYLIST_SHARE":
            return {
              fromUser: notification!.fromUser,
              playlist: notification!.playlist,
              type: notification!.type,
              id: notification!.id,
              text: notification!.text,
              imgUrl:
                notification!.playlist?.imgUrl ||
                notification!.fromUser?.imgUrl ||
                "/default-playlist.png",
            };
          case "SONG_LIKE":
          case "SONG_COMMENT":
            return {
              song: notification!.song,
              fromUser: notification!.fromUser,
              type: notification!.type,
              id: notification!.id,
              text: notification!.text,
              imgUrl:
                notification!.song?.imgUrl ||
                notification!.fromUser?.imgUrl ||
                "/default-song.png",
            };
          case "PLAYLIST_SONG_ADD":
            return {
              song: notification!.song,
              fromUser: notification!.fromUser,
              playlist: notification!.playlist,
              type: notification!.type,
              id: notification!.id,
              text: notification!.text,
              imgUrl:
                notification!.song?.imgUrl ||
                notification!.fromUser?.imgUrl ||
                "/default-song.png",
            };
          default:
            return {
              fromUser: notification!.fromUser,
              type: notification!.type,
              id: notification!.id,
              text: notification!.text,
              imgUrl: notification!.fromUser?.imgUrl || "/default-user.png",
            };
        }
      }
    );

    return fixedNotifications;
  }

  #getExtraData(type?: NotificationType, userId?: string) {
    const extraData: {
      fromUser: IUserSqlLogic;
      song?: ISongSqlLogic;
      playlist?: IPlaylistSmallSqlLogic;
    } = {
      fromUser: {
        select: {
          id: true,
          imgUrl: true,
          username: true,
        },
      },
    };
    switch (type) {
      case "PLAYLIST_COMMENT":
      case "PLAYLIST_LIKE":
      case "PLAYLIST_SHARE":
        extraData.playlist = playlistSmallSqlLogic;
        break;
      case "SONG_LIKE":
      case "SONG_COMMENT":
        // extraData.song = songSmallSqlLogic;
        break;
      case "PLAYLIST_SONG_ADD":
        extraData.playlist = playlistSmallSqlLogic;
        extraData.song = getSongSqlLogic(userId!);
      default:
        break;
    }
    return extraData;
  }
}

export const notificationService = new NotificationService();

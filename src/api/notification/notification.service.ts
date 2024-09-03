import { NotificationType } from "@prisma/client";
import { prisma } from "../../../prisma/prismaClient";
import { IPlaylistSmallSqlLogic } from "../playlists/sqlLogic.model";
import { ISongSmallSqlLogic } from "../songs/songSqlLogic.model";
import { INotification, INotificationData, INotificationDTO } from "./notification.model";
import { IUserSqlLogic } from "../users/userSqlLogic.model";
import { playlistSmallSqlLogic } from "../playlists/playlist.SqlLogic";
import { songSmallSqlLogic } from "../songs/songSqlLogic";

class NotificationService {
  async create(notificationDTO: INotificationDTO): Promise<INotification> {
    const extraData = this.#getExtraData(notificationDTO.type);

    const notification = await prisma.notification.create({
      data: notificationDTO,
      select: {
        id: true,
        type: true,
        text: true,
        ...extraData,
      },
    });

    const imgUrl = notification?.fromUser?.imgUrl || "/default-user.png";
    return { ...notification, imgUrl };
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
    id,
    playlistId,
    userId,
    songId,
  }: {
    id?: string;
    playlistId?: string;
    songId?: string;
    userId?: string;
  }) {
    if (!id && (!playlistId || !userId)) {
      throw new Error("You must provide an id or playlistId and userId");
    }

    await prisma.notification.delete({
      where: {
        id,
        playlistId,
        userId,
      },
    });
  }

  mapNotificationsDataToNotifications(notificationsData: INotificationData[]) {
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

  #getExtraData(type?: NotificationType) {
    const extraData: {
      fromUser: IUserSqlLogic;
      song?: ISongSmallSqlLogic;
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
        extraData.song = songSmallSqlLogic;
        break;
      default:
        break;
    }
    return extraData;
  }
}

export const notificationService = new NotificationService();

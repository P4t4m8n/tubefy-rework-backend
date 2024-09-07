import argon2 from "argon2";
import {
  IFullUser,
  IUser,
  IUserDTO,
  IUserFilters,
  IUserSignupDTO,
} from "./user.model";
import { prisma } from "../../../prisma/prismaClient";
import { IPlaylist } from "../playlists/playlist.model";
import { playlistService } from "../playlists/playlist.service";
import { songService } from "../song/song.service";
import { getDefaultLikesPlaylist } from "../../services/util";
import { friendService } from "../friends/friends.service";
import { notificationService } from "../notification/notification.service";

export class UserService {
  async create(userData: IUserSignupDTO): Promise<IUserDTO> {
    const { password, email, username, imgUrl } = userData;
    const hashedPassword = await argon2.hash(password);
    const newUser = await prisma.user.create({
      data: {
        password: hashedPassword,
        email,
        username,
        imgUrl,
      },
    });

    return newUser;
  }
  async getById(userId: string): Promise<IUserDTO | null> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  }
  async getByUsername(username: string): Promise<IUserDTO | null> {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    return user;
  }
  async getByEmail(email: string): Promise<IUserDTO | null> {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    return user;
  }
  async update(
    id: string,
    userData: Partial<IUserDTO>
  ): Promise<IUserDTO | null> {
    const user = await prisma.user.update({
      where: {
        id: id,
      },
      data: userData,
    });

    return user;
  }
  async remove(id: string): Promise<boolean> {
    await prisma.user.delete({
      where: {
        id: id,
      },
    });

    return true;
  }
  async query(filters: IUserFilters = {}): Promise<IUser[]> {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          filters.email ? { email: filters.email } : undefined,
          filters.username ? { username: filters.username } : undefined,
        ].filter(Boolean) as any,
      },
      select: {
        id: true,
        imgUrl: true,
        username: true,
      },
    });

    return users;
  }
  async getDetailedUser(owner: IUser): Promise<IFullUser> {
    const userData = await prisma.user.findUniqueOrThrow({
      relationLoadStrategy: "join",
      where: {
        id: owner.id,
      },
      select: {
        id: true,
        imgUrl: true,
        username: true,
        isAdmin: true,
        email: true,
        playlists: {
          select: {
            id: true,
            name: true,
            isPublic: true,
            imgUrl: true,
            createdAt: true,
            description: true,
            genres: true,
            types: true,
            playlistLikes: {
              where: {
                userId: owner.id,
              },
            },
            playlistSongs: {
              include: {
                song: {
                  select: {
                    id: true,
                    name: true,
                    artist: true,
                    imgUrl: true,
                    duration: true,
                    genres: true,
                    youtubeId: true,
                    addedAt: true,
                    addedBy: {
                      select: {
                        id: true,
                        imgUrl: true,
                        username: true,
                      },
                    },
                    songLikes: {
                      where: {
                        userId: owner.id,
                      },
                      select: {
                        id: true,
                      },
                    },
                  },
                },
              },
            },
            playlistShares: {},
          },
        },
        songLikes: {
          select: {
            song: {
              select: {
                id: true,
                name: true,
                artist: true,
                imgUrl: true,
                duration: true,
                genres: true,
                youtubeId: true,
                addedAt: true,
                addedBy: {
                  select: {
                    id: true,
                    imgUrl: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
        playlistLikes: {
          select: {
            playlist: {
              select: {
                id: true,
                name: true,
                imgUrl: true,
                isPublic: true,
                createdAt: true,
                description: true,
                genres: true,
                types: true,
                playlistLikes: {
                  where: {
                    userId: owner.id,
                  },
                },
                playlistSongs: {
                  include: {
                    song: {
                      select: {
                        id: true,
                        name: true,
                        artist: true,
                        imgUrl: true,
                        duration: true,
                        genres: true,
                        youtubeId: true,
                        addedAt: true,
                        addedBy: {
                          select: {
                            id: true,
                            imgUrl: true,
                            username: true,
                          },
                        },
                        songLikes: {
                          where: {
                            userId: owner.id,
                          },
                          select: {
                            id: true,
                          },
                        },
                      },
                    },
                  },
                },
                playlistShares: {},
              },
            },
          },
        },
        friends: {
          where: {
            status: {
              in: ["PENDING", "ACCEPTED", "REJECTED"],
            },
          },
          select: {
            status: true,
            id: true,
            createdAt: true,
            friend: {
              select: {
                id: true,
                username: true,
                imgUrl: true,
              },
            },
          },
        },
        friendsRequest: {
          where: {
            status: {
              in: ["PENDING", "ACCEPTED"],
            },
          },
          select: {
            status: true,
            id: true,
            createdAt: true,
            friend: {
              select: {
                id: true,
                username: true,
                imgUrl: true,
              },
            },
            user: {
              select: {
                id: true,
                username: true,
                imgUrl: true,
              },
            },
          },
        },
        notifications: {
          select: {
            id: true,
            text: true,
            type: true,
            fromUser: {
              select: {
                id: true,
                username: true,
                imgUrl: true,
              },
            },
            song: {
              select: {
                name: true,
                id: true,
                youtubeId: true,
                imgUrl: true,
                itemType: true,
              },
            },
            playlist: {
              select: {
                name: true,
                id: true,
                imgUrl: true,
                isPublic: true,
                itemType: true,
              },
            },
          },
        },
        PlaylistShare: {
          where: {
            status: { equals: "ACCEPTED" },
          },
          select: {
            id: true,
            playlist: {
              select: {
                id: true,
                name: true,
                imgUrl: true,
                isPublic: true,
                createdAt: true,
                description: true,
                genres: true,
                types: true,
                playlistLikes: {
                  where: {
                    userId: owner.id,
                  },
                },
                playlistSongs: {
                  include: {
                    song: {
                      select: {
                        id: true,
                        name: true,
                        artist: true,
                        imgUrl: true,
                        duration: true,
                        genres: true,
                        youtubeId: true,
                        addedAt: true,
                        addedBy: {
                          select: {
                            id: true,
                            imgUrl: true,
                            username: true,
                          },
                        },
                        songLikes: {
                          where: {
                            userId: owner.id,
                          },
                          select: {
                            id: true,
                          },
                        },
                      },
                    },
                  },
                },
                playlistShares: {},
              },
            },
          },
        },
      },
    });

    const userPlaylists: IPlaylist[] =
      playlistService.mapPlaylistDataToPlaylist(userData.playlists);

    const likedPlaylistsData = userData?.playlistLikes.map(
      (playlist) => playlist.playlist
    );

    const likedPlaylists: IPlaylist[] =
      playlistService.mapPlaylistDataToPlaylist(likedPlaylistsData);

    const sharedPlaylists: IPlaylist[] =
      playlistService.mapPlaylistDataToPlaylist(
        userData.PlaylistShare.map((share) => share.playlist)
      );

    const songsData = userData.songLikes.map((song) => song.song);
    const songs = songService.mapSongDataToSongs(songsData);

    const idx = userPlaylists.findIndex(
      (playlist) => playlist.name === "Liked Songs"
    );

    let likedSongsPlaylist = userPlaylists.splice(idx, 1)[0];
    //Check in case the user has no liked songs playlist
    if (!likedSongsPlaylist) {
      const playlistToSave = getDefaultLikesPlaylist(userData.id);
      likedSongsPlaylist = await playlistService.create(
        playlistToSave,
        userData
      );
    }

    likedSongsPlaylist.songs = songs;

    const { friends, friendsRequest } = friendService.categorizeFriendsByStatus(
      userData.friendsRequest
    );

    const { id, imgUrl, username, email, isAdmin, notifications } = userData;

    const fixedNotifications =
      notificationService.mapNotificationsDataToNotifications(
        userData.notifications
      );

    const user: IFullUser = {
      playlists: [...userPlaylists, ...likedPlaylists, ...sharedPlaylists],
      likedSongsPlaylist,
      user: {
        id,
        imgUrl,
        username,
        email,
        isAdmin,
      },
      friendsRequest,
      friends: [...friends, ...userData.friends],
      notifications: fixedNotifications,
    };

    return user;
  }
}

export const userService = new UserService();

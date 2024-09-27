import {
  IPlaylist,
  IPlaylistFilters,
  IPlaylistDTO,
  TPlaylistType,
  IPlaylistShare,
  IPlaylistsGroup,
} from "./playlist.model";
import { IUser } from "../users/user.model";
import { ISong } from "../song/song.model";
import { prisma } from "../../../prisma/prismaClient";
import { EGenres } from "../song/song.enum";
import { songService } from "../song/song.service";
import { playlistShareSqlLogic } from "./playlist.SqlLogic";
import { IShareSelectSqlLogic } from "./sqlLogic.model";
import { ShareStatus } from "@prisma/client";
import { IFriend } from "../friends/friends.model";
import { getSongSqlLogic, getSongSqlLogicNoLikes } from "../song/songSqlLogic";

class PlaylistService {
  #shareSelectSqlLogic: IShareSelectSqlLogic;
  constructor() {
    this.#shareSelectSqlLogic = playlistShareSqlLogic();
  }
  async create(playlistData: IPlaylistDTO, owner: IUser): Promise<IPlaylist> {
    const { name, isPublic, imgUrl, type, genres } = playlistData;

    const playlist = await prisma.playlist.create({
      data: { name, isPublic, imgUrl, ownerId: owner.id!, genres, type },
    });

    return {
      ...playlist,
      owner,
      genres: [],
      songs: [],
      duration: "00:00",
      itemType: "PLAYLIST",
      type: playlist.type as TPlaylistType,
    };
  }

  async createMany(data: IPlaylistDTO[], owner: IUser) {
    try {
      const playlists = await prisma.playlist.createMany({
        data,
      });
    } catch (error) {
      console.error("Error while creating playlists: ", error);
      throw new Error("Error while creating playlists");
    }
  }

  async getById(id: string, currentUserId?: string): Promise<IPlaylist | null> {
    const songSql = getSongSqlLogic(currentUserId || "");
    const playlistData = await prisma.playlist.findUnique({
      relationLoadStrategy: "join",
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            imgUrl: true,
            username: true,
          },
        },
        playlistSongs: {
          include: {
            song: {
              ...songSql,
            },
          },
        },
        playlistLikes: {
          where: {
            userId: currentUserId,
          },
        },
      },
    });
    if (!playlistData) return null;

    const playlist: IPlaylist = this.playlistDataToPlaylist(playlistData);

    return playlist;
  }

  async query(
    userId?: string,
    filters: IPlaylistFilters = {}
  ): Promise<IPlaylist[]> {
    const { limit } = filters;

    const queryFilters = this.#buildQueryFilters(filters, userId);
    const songSql = getSongSqlLogic(userId || "");

    const playlistsData = await prisma.playlist.findMany({
      relationLoadStrategy: "join",
      where: queryFilters,
      include: {
        owner: {
          select: {
            id: true,
            imgUrl: true,
            username: true,
          },
        },
        playlistSongs: {
          include: {
            song: {
              ...songSql,
            },
          },
        },
      },
      take: limit,
    });

    const playlists = this.mapPlaylistDataToPlaylist(playlistsData);

    return playlists;
  }

  async queryDefaultPlaylists(
    playlistTypes: TPlaylistType[],
    friends: IFriend[],
    country: string,
    userId?: string
  ): Promise<IPlaylistsGroup[]> {
    const songSql = getSongSqlLogic(userId || "");
    const playlistsByTypePromises = playlistTypes.map((type) =>
      prisma.playlist.findMany({
        relationLoadStrategy: "join",
        select: {
          id: true,
          name: true,
          imgUrl: true,
          isPublic: true,
          createdAt: true,
          type: true,
          genres: true,
          description: true,
          owner: {
            select: {
              id: true,
              imgUrl: true,
              username: true,
            },
          },
          playlistSongs: {
            select: {
              song: {
                ...songSql,
              },
            },
          },
          playlistLikes: {
            select: {
              userId: true,
            },
          },
        },
        where: {
          type: {
            equals: type,
          },
          isPublic: {
            equals: true,
          },
        },
        take: 6,
      })
    );

    const localPlaylistsPromise = prisma.playlist.findMany({
      relationLoadStrategy: "join",
      select: {
        id: true,
        name: true,
        imgUrl: true,
        isPublic: true,
        createdAt: true,
        type: true,
        genres: true,
        description: true,
        owner: {
          select: {
            id: true,
            imgUrl: true,
            username: true,
          },
        },
        playlistSongs: {
          select: {
            song: {
              ...songSql,
            },
          },
        },
        playlistLikes: {
          select: {
            userId: true,
          },
        },
      },
      where: {
        playlistSongs: {
          some: {
            song: {
              originCountry: {
                equals: country,
              },
            },
          },
        },
        isPublic: {
          equals: true,
        },
      },
      take: 6,
    });

    const friendsPlaylistPromises = friends.map((friend) =>
      prisma.playlist.findMany({
        relationLoadStrategy: "join",
        select: {
          id: true,
          name: true,
          imgUrl: true,
          isPublic: true,
          createdAt: true,
          type: true,
          genres: true,
          description: true,

          owner: {
            select: {
              id: true,
              imgUrl: true,
              username: true,
            },
          },
          playlistSongs: {
            select: {
              song: {
                ...songSql,
              },
            },
          },
          playlistLikes: {
            select: {
              userId: true,
            },
          },
        },
        where: {
          ownerId: friend.friend.id,
          isPublic: {
            equals: true,
          },
        },
        take: 1,
      })
    );

    const [playlistsByTypeArr, localPlaylistsArr, friendsPlaylistsArr] =
      await Promise.all([
        Promise.all(playlistsByTypePromises),
        localPlaylistsPromise,
        Promise.all(friendsPlaylistPromises),
      ]);

    const playlistsByType: TPlaylistData[] = playlistsByTypeArr.flat();
    let friendsPlaylists: TPlaylistData[] = friendsPlaylistsArr.flat();

    friendsPlaylists = friendsPlaylists.map((p) => ({
      ...p,
      type: "From you friends",
    }));
    const localPlaylists = localPlaylistsArr.map((p) => ({
      ...p,
      type: "Local Music",
    }));

    const playlists = this.mapPlaylistDataToPlaylist([
      ...playlistsByType,
      ...friendsPlaylists,
      ...localPlaylists,
    ]);

    const playlistsGroup = this.#playlistsToPlaylistsGroup(playlists);

    return playlistsGroup;
  }

  async update(
    id: string,
    updateData: IPlaylistDTO
  ): Promise<IPlaylistDTO | null> {
    const songSql = getSongSqlLogicNoLikes();
    const playlist = await prisma.playlist.update({
      where: { id },
      data: {
        name: updateData.name,
        isPublic: updateData.isPublic,
        imgUrl: updateData.imgUrl,
        type: updateData.type,
        genres: updateData.genres,
      },
      include: {
        playlistSongs: {
          select: {
            song: {
              ...songSql,
            },
          },
        },
      },
    });

    const duration = updateData.duration || "00:00";
    return {
      ...playlist,
      type: playlist.type as TPlaylistType,
      genres: playlist.genres as EGenres[],
      duration,
    };
  }

  async remove(id: string): Promise<boolean> {
    const check = await prisma.playlist.delete({
      where: { id },
    });

    return !!check;
  }

  async addSongToPlaylist(
    playlistId: string,
    songId: string
  ): Promise<{
    playlist: { name: string };
    song: { id: string; name: string };
  }> {
    const playlistSong = await prisma.playlistSong.upsert({
      where: {
        songId_playlistId: {
          songId,
          playlistId,
        },
      },
      update: {},
      create: {
        playlistId,
        songId,
      },
      select: {
        playlist: {
          select: {
            name: true,
          },
        },
        song: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return playlistSong;
  }

  async removeSongFromPlaylist(
    playlistId: string,
    songId: string
  ): Promise<boolean> {
    const playlistSong = await prisma.playlistSong.deleteMany({
      where: {
        playlistId,
        songId,
      },
    });

    return !!playlistSong;
  }

  async likePlaylist(playlistId: string, userId: string): Promise<boolean> {
    const createCheck = await prisma.playlistLike.create({
      data: { playlistId, userId },
    });

    return !!createCheck;
  }

  async unlikePlaylist(playlistId: string, userId: string): Promise<boolean> {
    const deleteCheck = await prisma.playlistLike.deleteMany({
      where: { playlistId, userId },
    });

    return !!deleteCheck;
  }

  async removeShare(playlistId: string, userId: string): Promise<boolean> {
    await prisma.playlistShare.delete({
      where: { playlistId_userId: { playlistId, userId } },
    });

    return true;
  }

  async saveShare({
    playlistId,
    userId,
    sessionId,
    status,
    isOpen,
  }: {
    playlistId: string;
    userId: string;
    sessionId?: string;
    status?: ShareStatus;
    isOpen?: boolean;
  }): Promise<{
    share: IPlaylistShare;
    playlist: { name: string; imgUrl: string; playlistId: string };
  }> {
    // Get the playlist's owner id, name and imgUrl for socket emit
    const { ownerId, name, imgUrl } = await prisma.playlist.findUniqueOrThrow({
      where: { id: playlistId },
      select: { ownerId: true, name: true, imgUrl: true },
    });

    // If isOpen is provided, it means the user wants to change the share status
    if (isOpen !== undefined) {
      // Only the owner can change the share status
      if (ownerId !== sessionId || !sessionId)
        throw new Error("Not authorized");
    }

    const share = await prisma.playlistShare.upsert({
      where: { playlistId_userId: { playlistId, userId: userId } },
      update: { isOpen, status },
      create: { playlistId, userId: userId },
      select: this.#shareSelectSqlLogic,
    });

    const playlist = {
      name,
      imgUrl,
      playlistId,
    };

    return { share, playlist };
  }

  async approveShare({
    playlistId,
    userId,
  }: {
    playlistId: string;
    userId: string;
  }): Promise<IPlaylist> {
    const songSql = getSongSqlLogic(userId);
    const playlistData = await prisma.playlistShare.update({
      where: { playlistId_userId: { playlistId, userId: userId } },
      data: { status: "ACCEPTED" },
      select: {
        playlist: {
          select: {
            id: true,
            imgUrl: true,
            name: true,
            isPublic: true,
            description: true,
            createdAt: true,
            genres: true,
            type: true,
            owner: {
              select: {
                id: true,
                imgUrl: true,
                username: true,
              },
            },
            playlistSongs: {
              include: {
                song: {
                  ...songSql,
                },
              },
            },
            playlistLikes: {
              where: {
                userId,
              },
            },
          },
        },
      },
    });

    const playlist: IPlaylist = this.playlistDataToPlaylist(
      playlistData.playlist
    );

    return playlist;
  }

  async getUserLikedSongsPlaylist(userId: string): Promise<IPlaylist> {
    const songSql = getSongSqlLogicNoLikes();

    const likedSongsPlaylistData = await prisma.playlist.findFirst({
      relationLoadStrategy: "join",
      where: { ownerId: userId, name: "Liked Songs" },
      select: {
        id: true,
        imgUrl: true,
        isPublic: true,
        createdAt: true,
        type: true,
        genres: true,
        name: true,
        owner: {
          select: {
            id: true,
            imgUrl: true,
            username: true,
            songLikes: {
              where: {
                userId: userId,
              },
              select: {
                song: {
                  ...songSql,
                },
              },
            },
          },
        },
      },
    });

    if (!likedSongsPlaylistData)
      throw new Error("Liked songs playlist not found");

    const likedSongsData =
      likedSongsPlaylistData?.owner.songLikes.map(
        (songLike) => songLike.song
      ) || [];
    const songs: ISong[] = songService.mapSongDataToSongs(likedSongsData);
    const owner = {
      id: likedSongsPlaylistData?.owner.id,
      imgUrl: likedSongsPlaylistData?.owner.imgUrl,
      username: likedSongsPlaylistData?.owner.username,
    };

    const duration = this.getTotalDuration(songs);

    const { id, imgUrl, isPublic, createdAt, type, genres, name } =
      likedSongsPlaylistData;
    const playlist: IPlaylist = {
      id,
      name,
      imgUrl,
      isPublic,
      createdAt,
      owner,
      type: type as TPlaylistType,
      genres: genres as EGenres[],
      songs,
      duration,
      itemType: "PLAYLIST",
    };

    return playlist;
  }

  getTotalDuration(songs: ISong[]): string {
    let totalSeconds = songs.reduce((total, song) => {
      const duration = song.duration || "00:00";
      const [minutes, seconds] = duration.split(":").map(Number);
      return total + minutes * 60 + seconds;
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const days = Math.floor(hours / 24);
    const effectiveHours = hours % 24;

    const pad = (num: number) => String(num).padStart(2, "0");

    const hoursString =
      days > 0 ? String(days * 24 + effectiveHours) : pad(effectiveHours);

    return `${hoursString}:${pad(minutes)}:${pad(seconds)}`;
  }

  mapPlaylistDataToPlaylist(
    playlistData: TPlaylistData[],
    owner?: IUser
  ): IPlaylist[] {
    const playlists = playlistData.map((playlistData) => {
      return this.playlistDataToPlaylist(playlistData, owner);
    });

    return playlists;
  }

  playlistDataToPlaylist(
    playlistData: TPlaylistData,
    owner?: IUser
  ): IPlaylist {
    const songsData = playlistData.playlistSongs.map(
      (playlistSong) => playlistSong.song
    );
    const songs = songService.mapSongDataToSongs(songsData);
    const duration = this.getTotalDuration(songs);
    const playlist: IPlaylist = {
      id: playlistData.id,
      name: playlistData.name,
      imgUrl: playlistData.imgUrl || "",
      isPublic: playlistData.isPublic,
      createdAt: playlistData.createdAt,
      owner: owner ? owner : playlistData.owner!,
      description: playlistData.description || "",
      songs,
      duration,
      type: playlistData.type as TPlaylistType,
      genres: playlistData.genres as EGenres[],
      itemType: "PLAYLIST",
      isLikedByUser: !!playlistData?.playlistLikes?.length,
    };
    return playlist;
  }

  async fetchSharedPlaylistsId(userId: string): Promise<string[]> {
    try {
      const playlists = await prisma.playlistShare.findMany({
        where: { OR: [{ userId }, { playlist: { ownerId: userId } }] },
        select: {
          playlist: {
            select: {
              id: true,
            },
          },
        },
      });
      return playlists.map((playlist) => playlist.playlist.id);
    } catch (error) {
      console.error("Error while fetching shared playlists: ", error);
      throw new Error("Error while fetching shared playlists");
    }
  }

  async fetchSharedUserToPlaylists(playlistId: string, userId?: string) {
    const sharedUsersData = await prisma.playlistShare.findMany({
      where: { playlistId },
      select: {
        user: {
          select: {
            id: true,
            username: true,
            imgUrl: true,
          },
        },
        playlist: {
          select: {
            owner: {
              select: {
                id: true,
                username: true,
                imgUrl: true,
              },
            },
          },
        },
      },
    });
    const sharedUsers = sharedUsersData.map((user) => user.user);

    if (userId && sharedUsersData[0].playlist.owner.id !== userId) {
      sharedUsers.push(sharedUsersData[0].playlist.owner);
    }

    return sharedUsers;
  }

  #buildQueryFilters(filters: IPlaylistFilters, userId?: string) {
    const { name, isPublic, ownerId, artist, genres, isLikedByUser } = filters;

    const queryFilters: any = {};

    if (name) queryFilters.name = { contains: name };
    if (isPublic !== undefined)
      queryFilters.isPublic = {
        equals: isPublic,
      };
    if (ownerId) queryFilters.ownerId = ownerId;
    if (artist)
      queryFilters.playlistSongs = {
        some: {
          song: {
            artist: {
              contains: artist,
              mode: "insensitive",
            },
          },
        },
      };

    if (genres && genres.length > 0)
      queryFilters.genres = {
        hasSome: genres,
      };

    if (isLikedByUser)
      queryFilters.playlistLikes = {
        some: {
          userId: userId,
        },
      };

    return queryFilters;
  }

  #playlistsToPlaylistsGroup(playlists: IPlaylist[]): IPlaylistsGroup[] {
    const playlistMap = new Map<TPlaylistType, IPlaylist[]>();

    playlists.forEach((playlist) => {
      if (!playlistMap.has(playlist.type)) {
        playlistMap.set(playlist.type, []);
      }
      playlistMap.get(playlist.type)!.push(playlist);
    });

    const playlistObjects: IPlaylistsGroup[] = [];
    playlistMap.forEach((playlists, type) => {
      playlistObjects.push({ type, playlists });
    });

    return playlistObjects;
  }
}

export const playlistService = new PlaylistService();

type TPlaylistData = {
  id: string;
  name: string;
  ownerId?: string;
  isPublic: boolean;
  imgUrl: string | null;
  createdAt: Date;
  description: string | null;
  genres: string[];
  type: string;
  owner?: {
    id: string;
    imgUrl: string | null;
    username: string;
  };
  playlistSongs: {
    id?: string;
    songId?: string;
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
        imgUrl: string | null;
        username: string;
      };
      songLikes: {
        id: string;
      }[];
    };
  }[];
  playlistLikes?: {
    userId: string;
  }[];
};

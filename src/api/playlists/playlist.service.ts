import {
  IPlaylist,
  IPlaylistFilters,
  IPlaylistCreateDTO,
  IPlaylistUpdateDTO,
  ILikedSongsPlaylist,
} from "./playlist.model";
import { IUser } from "../users/user.model";
import { ISong } from "../songs/song.model";
import { prisma } from "../../../prisma/prismaClient";
import { PlaylistType } from "./playlist.enum";
import { Genres } from "../songs/song.enum";

export class PlaylistService {
  async create(
    playlistData: IPlaylistUpdateDTO,
    user: IUser
  ): Promise<IPlaylist> {
    const { name, isPublic, imgUrl, types, genres } = playlistData;

    const playlist = await prisma.playlist.create({
      data: { name, isPublic, imgUrl, ownerId: user.id!, types, genres },
    });

    return {
      ...playlist,
      owner: user,
      shares: { count: 0 },
      genres: [],
      songs: [],
      duration: "00:00",
      types: playlist.types as PlaylistType[],
    };
  }

  async createMany(
    dataA: IPlaylistUpdateDTO[],
    user: IUser
  ): Promise<IPlaylist[]> {
    const data: any = dataA.map((playlist) => ({
      ...playlist,
      ownerId: user.id!,
      genres: playlist.genres as Genres[],
      types: playlist.types as PlaylistType[],
    }));

    const playlists = await prisma.playlist.createManyAndReturn({
      data,
    });

    return playlists.map((playlist) => ({
      ...playlist,
      owner: user,
      shares: { count: 0 },
      genres: [],
      songs: [],
      duration: "00:00",
      types: playlist.types as PlaylistType[],
    }));
  }

  async getById(id: string, currentUserId?: string): Promise<IPlaylist | null> {
    const playlistData = await prisma.playlist.findUnique({
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
                    userId: currentUserId,
                  },
                  select: {
                    id: true,
                    userId: true,
                    songId: true,
                  },
                },
              },
            },
          },
        },
        playlistShares: {},
        playlistLikes: {
          where: {
            userId: currentUserId,
          },
        },
      },
    });
    if (!playlistData) return null;
    const songs = playlistData.playlistSongs.map((playlistSong) => {
      const song: ISong = {
        ...playlistSong.song,
        isLikedByUser: playlistSong.song.songLikes.length > 0,
        addBy: playlistSong.song.addedBy,
        genres: playlistSong.song.genres as Genres[],
      };
      return song;
    });

    const duration = this.getTotalDuration(songs);

    const playlist: IPlaylist = {
      id: playlistData.id,
      name: playlistData.name,
      isLikedByUser: playlistData.playlistLikes.length > 0,
      imgUrl: playlistData.imgUrl,
      songs,
      genres: playlistData.genres as Genres[],
      isPublic: playlistData.isPublic,
      createdAt: playlistData.createdAt,
      types: playlistData.types as PlaylistType[],
      owner: playlistData.owner,
      shares: { count: 0 },
      duration,
    };

    return playlist;
  }

  async query(
    userId?: string,
    filters: IPlaylistFilters = {}
  ): Promise<IPlaylist[]> {
    const { name, isPublic, ownerId, artist, genres, isLikedByUser, limit } =
      filters;

    const queryFilters: any = {};

    if (!!name) queryFilters.name = { contains: name };
    if (!!isPublic)
      queryFilters.isPublic = {
        equals: isPublic,
      };
    if (!!ownerId) queryFilters.ownerId = ownerId;
    if (!!artist)
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

    if (!!genres && genres.length > 0)
      queryFilters.genres = {
        hasSome: genres,
      };

    if (!!isLikedByUser)
      queryFilters.playlistLikes = {
        some: {
          userId: userId,
        },
      };

    const playlistsData = await prisma.playlist.findMany({
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
                    userId: userId,
                  },
                  select: {
                    id: true,
                    userId: true,
                    songId: true,
                  },
                },
              },
            },
          },
        },
        playlistShares: {},
      },
      take: limit,
    });

    const playlists = playlistsData.map((playlistData) => {
      const songs = playlistData.playlistSongs.map((playlistSong) => {
        const song: ISong = {
          ...playlistSong.song,
          isLikedByUser: playlistSong.song.songLikes.length > 0,
          addBy: playlistSong.song.addedBy,
          genres: playlistSong.song.genres as Genres[],
        };
        return song;
      });

      const duration = this.getTotalDuration(songs);
      const playlist: IPlaylist = {
        id: playlistData.id,
        name: playlistData.name,
        imgUrl: playlistData.imgUrl,
        isPublic: playlistData.isPublic,
        createdAt: playlistData.createdAt,
        owner: playlistData.owner,
        shares: { count: 0 },
        songs,
        duration,
        types: playlistData.types as PlaylistType[],
        genres: playlistData.genres as Genres[],
      };
      return playlist;
    });

    return playlists;
  }

  async update(
    id: string,
    updateData: IPlaylist
  ): Promise<IPlaylistCreateDTO | null> {
    const playlist = prisma.playlist.update({
      where: { id },
      data: {
        name: updateData.name,
        isPublic: updateData.isPublic,
        imgUrl: updateData.imgUrl,
        types: updateData.types,
        genres: updateData.genres,
      },
    });

    return playlist;
  }

  async remove(id: string): Promise<boolean> {
    const playlist = prisma.playlist.delete({
      where: { id },
    });

    return !!playlist;
  }

  async addSongToPlaylist(
    playlistId: string,
    songId: string
  ): Promise<boolean> {
    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId,
        songId,
      },
    });

    return !!playlistSong;
  }

  async removeSongFromPlaylist(
    playlistId: string,
    songId: string
  ): Promise<boolean> {
    const playlistSong = prisma.playlistSong.deleteMany({
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

  async sharePlaylist(playlistId: string, userId: string): Promise<boolean> {
    const playlistShare = await prisma.playlistShare.findFirst({
      where: { playlistId, userId },
    });

    if (!!playlistShare) {
      const { id } = playlistShare;
      const deleteCheck = await prisma.playlistShare.delete({
        where: { id },
      });

      return !!deleteCheck;
    }

    const createCheck = await prisma.playlistShare.create({
      data: { playlistId, userId },
    });

    return !!createCheck;
  }

  async createUserLikesPlaylist(userId: string): Promise<ILikedSongsPlaylist> {
    const likedSongsPlaylist = await prisma.likedSongsPlaylist.create({
      data: {
        isPublic: false,
        userId: userId,
      },
    });

    return {
      ...likedSongsPlaylist,
      songs: [],
      duration: "00:00",
      shares: { count: 0 },
      name: "Liked Songs",
    };
  }

  async getUserLikedSongsPlaylist(
    userId: string
  ): Promise<ILikedSongsPlaylist> {
    const likedSongsPlaylistData = await prisma.likedSongsPlaylist.findFirst({
      where: { userId },
      include: {
        user: {
          include: {
            songLikes: {
              include: {
                song: true,
              },
            },
          },
          
        },
      },
    });

    const addBy = {
      username: likedSongsPlaylistData!.user.username,
      imgUrl: likedSongsPlaylistData!.user.imgUrl,
      id: likedSongsPlaylistData!.user.id,
    };
    const songs: ISong[] =
      likedSongsPlaylistData?.user.songLikes.map((songLike) => {
        const isLikedByUser = true;
        const genres = songLike.song.genres as Genres[];
        return { ...songLike.song, isLikedByUser, addBy, genres };
      }) || [];

    const duration = this.getTotalDuration(songs);
    const { id, imgUrl, isPublic } = likedSongsPlaylistData!;

    return {
      songs,
      id,
      name: "Liked Songs",
      imgUrl,
      isPublic,
      duration,
      shares: { count: 0 },
    };
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
}

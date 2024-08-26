import {
  IPlaylist,
  IPlaylistFilters,
  IPlaylistCreateDTO,
  TPlaylistType,
  
} from "./playlist.model";
import { IUser } from "../users/user.model";
import { ISong } from "../songs/song.model";
import { prisma } from "../../../prisma/prismaClient";
import { Genres } from "../songs/song.enum";
import { songService } from "../songs/song.service";

export class PlaylistService {
  async create(
    playlistData: IPlaylistCreateDTO,
    owner: IUser
  ): Promise<IPlaylist> {
    const { name, isPublic, imgUrl, types, genres } = playlistData;

    const playlist = await prisma.playlist.create({
      data: { name, isPublic, imgUrl, ownerId: owner.id!, types, genres },
    });

    return {
      ...playlist,
      owner,
      genres: [],
      songs: [],
      duration: "00:00",
      types: playlist.types as TPlaylistType[],
    };
  }

  async getById(id: string, currentUserId?: string): Promise<IPlaylist | null> {
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
        playlistLikes: {
          where: {
            userId: currentUserId,
          },
        },
      },
    });
    if (!playlistData) return null;

    const playlist: IPlaylist = this.transformPlaylistData(playlistData);

    return playlist;
  }

  async query(
    userId?: string,
    filters: IPlaylistFilters = {}
  ): Promise<IPlaylist[]> {
    const { limit } = filters;

    const queryFilters = this.#buildQueryFilters(filters, userId);

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
      },
      take: limit,
    });

    const playlists = this.playlistDataToPlaylist(playlistsData);

    return playlists;
  }

  async update(
    id: string,
    updateData: IPlaylist
  ): Promise<IPlaylistCreateDTO | null> {
    const playlist = await prisma.playlist.update({
      where: { id },
      data: {
        name: updateData.name,
        isPublic: updateData.isPublic,
        imgUrl: updateData.imgUrl,
        types: updateData.types,
        genres: updateData.genres,
      },
    });

    return {
      ...playlist,
      types: playlist.types as TPlaylistType[],
      genres: playlist.genres as Genres[],
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
  ): Promise<boolean> {
    try {
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
      });

      return !!playlistSong;
    } catch (error) {
      console.error(`Error while adding song to playlist: ${error}`);
      return false;
    }
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

  async getUserLikedSongsPlaylist(userId: string): Promise<IPlaylist> {
    const likedSongsPlaylistData = await prisma.playlist.findFirst({
      relationLoadStrategy: "join",
      where: { ownerId: userId, name: "Liked Songs" },
      select: {
        id: true,
        imgUrl: true,
        isPublic: true,
        createdAt: true,
        types: true,
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
    const songs: ISong[] = songService.songDataToSong(likedSongsData);
    const owner = {
      id: likedSongsPlaylistData?.owner.id,
      imgUrl: likedSongsPlaylistData?.owner.imgUrl,
      username: likedSongsPlaylistData?.owner.username,
    };

    const duration = this.getTotalDuration(songs);

    const { id, imgUrl, isPublic, createdAt, types, genres, name } =
      likedSongsPlaylistData;
    const playlist: IPlaylist = {
      id,
      name,
      imgUrl,
      isPublic,
      createdAt,
      owner,
      types: types as TPlaylistType[],
      genres: genres as Genres[],
      songs,
      duration,
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

  playlistDataToPlaylist(
    playlistData: TPlaylistData[],
    owner?: IUser
  ): IPlaylist[] {
    const playlists = playlistData.map((playlistData) => {
      return this.transformPlaylistData(playlistData, owner);
    });

    return playlists;
  }

  transformPlaylistData(playlistData: TPlaylistData, owner?: IUser): IPlaylist {
    const songsData = playlistData.playlistSongs.map(
      (playlistSong) => playlistSong.song
    );
    const songs = songService.songDataToSong(songsData);
    const duration = this.getTotalDuration(songs);
    const playlist: IPlaylist = {
      id: playlistData.id,
      name: playlistData.name,
      imgUrl: playlistData.imgUrl || "",
      isPublic: playlistData.isPublic,
      createdAt: playlistData.createdAt,
      owner: owner ? owner : playlistData.owner!,
      songs,
      duration,
      types: playlistData.types as TPlaylistType[],
      genres: playlistData.genres as Genres[],
    };
    return playlist;
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
  types: string[];
  owner?: {
    id: string;
    imgUrl: string | null;
    username: string;
  };
  playlistSongs: {
    id: string;
    songId: string;
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
};

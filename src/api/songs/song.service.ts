import { ISong, ISongDTO, ISongFilter } from "./song.model";
import { Genres } from "./song.enum";
import { IUser } from "../users/user.model";
import { prisma } from "../../../prisma/prismaClient";

export class SongService {
  async create(songData: ISongDTO, user: IUser): Promise<ISong> {
    const song = await prisma.song.create({
      data: {
        youtubeId: songData.youtubeId,
        addByUserId: songData.addByUserId,
        name: songData.name,
        artist: songData.artist,
        imgUrl: songData.imgUrl,
        duration: songData.duration,
        genres: songData.genres as  Genres[],
      },
    });
    return {
      ...song,
      isLikedByUser: false,
      addedBy: user,
      genres: song.genres as  Genres[],
    };
  }

  async createMany(data: ISongDTO[], user: IUser): Promise<ISong[]> {
    const songs = await prisma.song.createManyAndReturn({
      data: data.map((song) => ({
        ...song,
        genres: song.genres  as Genres[],
      })),
    });

    return songs.map((song) => ({
      ...song,
      isLikedByUser: false,
      addedBy: user,
      genres: song.genres as  Genres[],
    }));
  }

  async query(songFilter: ISongFilter, userId?: string): Promise<ISong[]> {
    const { name, artist, genres, addByUserId, isLikedByUser } = songFilter;

    const queryFilters: any = {};
    switch (true) {
      case !!name:
        queryFilters.name = { contains: name };
        break;
      case !!artist:
        queryFilters.artist = { contains: artist };
        break;
      case !!addByUserId:
        queryFilters.addByUserId = addByUserId;

      case !!genres:
        queryFilters.genres = {
          hasSome: genres,
        };

      case !!isLikedByUser && !!userId:
        queryFilters.songLikes = {
          some: {
            userId: userId,
          },
        };
    }

    const songsData = await prisma.song.findMany({
      where: queryFilters,
      include: {
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
        },
      },
    });

    const songs: ISong[] = songsData.map((song) => ({
      ...song,
      isLikedByUser: song.songLikes.length > 0,
      addBy: song.addedBy,
      genres: song.genres as  Genres[],
    }));

    return songs;
  }

  async likeSong(songId: string, userId: string): Promise<boolean> {
    const likedSongsCheck = await prisma.songLike.create({
      data: {
        userId: userId,
        songId: songId,
      },
    });

    return !!likedSongsCheck;
  }

  async unlikeSong(songId: string, userId: string): Promise<boolean> {
    const unlikeSongsCheck = await prisma.songLike.deleteMany({
      where: {
        userId: userId,
        songId: songId,
      },
    });

    return !!unlikeSongsCheck;
  }
}

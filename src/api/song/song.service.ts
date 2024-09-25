import { ISong, ISongDTO, ISongFilter } from "./song.model";
import { EGenres } from "./song.enum";
import { IUser } from "../users/user.model";
import { prisma } from "../../../prisma/prismaClient";
import { TPlaylistType } from "../playlists/playlist.model";

export class SongService {
  async create(songData: ISongDTO, user: IUser): Promise<ISong> {
    const song = await prisma.song.create({
      data: {
        youtubeId: songData.youtubeId,
        addByUserId: user.id!,
        name: songData.name,
        artist: songData.artist,
        imgUrl: songData.imgUrl,
        duration: songData.duration,
        genres: songData.genres as EGenres[],
      },
    });
    return {
      ...song,
      isLikedByUser: false,
      addedBy: user,
      genres: song.genres as EGenres[],
      itemType: "SONG",
      playlistType: songData.playlistType || [],
    };
  }
  async createMany(data: ISongDTO[], user: IUser): Promise<ISong[]> {
    const songs = await prisma.song.createManyAndReturn({
      data,
    });

    return songs.map((song) => ({
      ...song,
      isLikedByUser: false,
      addedBy: user,
      genres: song.genres as EGenres[],
      itemType: "SONG",
      playlistType: (song.playlistType as TPlaylistType[]) || [],
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

    const songs: ISong[] = this.mapSongDataToSongs(songsData);

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
  async update(songDTO: ISongDTO, songId: string): Promise<ISong> {
    const songData = await prisma.song.update({
      where: {
        id: songId,
      },
      data: {
        name: songDTO.name,
        artist: songDTO.artist,
        genres: songDTO.genres as EGenres[],
        duration: songDTO.duration,
        imgUrl: songDTO.imgUrl,
        youtubeId: songDTO.youtubeId,
        playlistType: songDTO.playlistType,
      },
      include: {
        addedBy: {
          select: {
            id: true,
            imgUrl: true,
            username: true,
          },
        },
      },
    });

    const song = this.songDataToSong(songData);
    return song;
  }
  mapSongDataToSongs(songsData: songData[]): ISong[] {
    const songs = songsData.map((songData) => this.songDataToSong(songData));
    return songs;
  }
  songDataToSong(songData: songData): ISong {
    const song: ISong = {
      ...songData,
      isLikedByUser: songData.songLikes ? songData.songLikes.length > 0 : true,
      addedBy: songData.addedBy,
      genres: songData.genres as EGenres[],
      itemType: "SONG",
    };
    return song;
  }
  async getLikedSongs(userId: string): Promise<ISong[]> {
    const likedSongsData = await prisma.songLike.findMany({
      where: {
        userId,
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
    });

    const songs = this.mapSongDataToSongs(
      likedSongsData.map((data) => data.song)
    );

    return songs;
  }
}

export const songService = new SongService();
type songData = {
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
  songLikes?: {
    id: string;
  }[];
};

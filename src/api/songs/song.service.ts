import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db";
import { songLikes, songs, users } from "../../db/schema";
import { ISong, ISongDTO, ISongFilter } from "./song.model";
import { Genres } from "./song.enum";
import { IUser } from "../users/user.model";

export class SongService {
  async create(songData: Omit<ISongDTO, "id">): Promise<ISong> {
    return await db.transaction(async (trx) => {
      const [newSong] = await trx.insert(songs).values(songData).returning();

      const [fullSong] = await trx
        .select({
          id: songs.id,
          youtubeId: songs.youtubeId,
          name: songs.name,
          artist: songs.artist,
          thumbnail: songs.thumbnail,
          duration: songs.duration,
          addedAt: songs.addedAt,
          genres: songs.genres,
          addBy: {
            id: users.id,
            username: users.username,
            email: users.email,
            avatarUrl: users.avatarUrl,
            isAdmin: users.isAdmin,
            createdAt: users.createdAt,
          },
        })
        .from(songs)
        .innerJoin(users, eq(users.id, songs.addByUserId))
        .where(eq(songs.id, newSong.id));

      const fixedSong = {
        ...fullSong,
        genres: fullSong.genres as Genres[],
      };

      return fixedSong;
    });
  }

  async get(songFilter: ISongFilter): Promise<ISong[]> {
    const { userId } = songFilter;
    const songsData = await db
      .select({
        id: songs.id,
        youtubeId: songs.youtubeId,
        name: songs.name,
        artist: songs.artist,
        thumbnail: songs.thumbnail,
        genres: songs.genres,
        duration: songs.duration,
        addBy: sql<IUser>`
      (SELECT json_build_object(
        'id', ${users.id},
        'username', ${users.username},
        'email', ${users.email},
        'avatarUrl', ${users.avatarUrl},
        'isAdmin', ${users.isAdmin}
      )
      FROM ${users}
      WHERE ${users.id} = ${songs.addByUserId}
      LIMIT 1)
    `.as("addBy"),
        addedAt: songs.addedAt,
        isLikedByUser: sql<boolean>`
        CASE WHEN EXISTS (
          SELECT 1 FROM ${songLikes}
          WHERE ${songLikes.songId} = ${songs.id}
          AND ${songLikes.userId} = ${userId ?? null}
        ) THEN true ELSE false END
      `.as("isLikedByUser"),
      })
      .from(songs);

    const fixedSongs = songsData.map((song) => ({
      ...song,
      genres: song.genres as Genres[],
    }));

    return fixedSongs;
  }

  async toggleLike(songId: string, userId: string): Promise<boolean> {
    const likedSong = await db
      .select()
      .from(songLikes)
      .where(and(eq(songLikes.songId, songId), eq(songLikes.userId, userId)))
      .limit(1);

    if (likedSong.length) {
      await db
        .delete(songLikes)
        .where(and(eq(songLikes.songId, songId), eq(songLikes.userId, userId)));
      return false;
    }

    await db.insert(songLikes).values({ songId, userId });
    return true;
  }
}

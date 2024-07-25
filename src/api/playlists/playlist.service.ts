import { and, eq, SQL, sql } from "drizzle-orm";
import {
  IPlaylist,
  IDetailedPlaylist,
  IPlaylistFilters,
} from "./playlist.model";
import { db } from "../../db";
import {
  playlists,
  playlistSongs,
  playlistLikes,
  playlistShares,
  songs,
  users,
  songLikes,
} from "../../db/schema";


export class PlaylistService {
  async createPlaylist(
    playlistData: Omit<IPlaylist, "id">
  ): Promise<IPlaylist> {
    const [newPlaylist] = await db
      .insert(playlists)
      .values(playlistData)
      .returning();
    return newPlaylist;
  }

  async getPlaylistById(
    id: string,
    currentUserId?: string
  ): Promise<IDetailedPlaylist | null> {
    const [playlist] = await db
      .select({
        id: playlists.id,
        name: playlists.name,
        ownerId: playlists.ownerId,
        isPublic: playlists.isPublic,
        createdAt: playlists.createdAt,
        imgUrl: playlists.imgUrl,
        isLikedByUser: sql<boolean>`
          CASE WHEN EXISTS (
            SELECT 1 FROM ${playlistLikes}
            WHERE ${playlistLikes.playlistId} = ${playlists.id}
            AND ${playlistLikes.userId} = ${currentUserId}
          ) THEN true ELSE false END
        `.as("isLikedByUser"),
      })
      .from(playlists)
      .where(eq(playlists.id, id))
      .limit(1);

    if (!playlist) return null;

    const playlistSongsData = await db
      .select({
        id: songs.id,
        youtubeId: songs.youtubeId,
        title: songs.title,
        artist: songs.artist,
        thumbnail: songs.thumbnail,
        duration: songs.duration,
        isLikedByUser: sql<boolean>`
          CASE WHEN EXISTS (
            SELECT 1 FROM ${songLikes}
            WHERE ${songLikes.songId} = ${songs.id}
            AND ${songLikes.userId} = ${currentUserId}
          ) THEN true ELSE false END
        `.as("isLikedByUser"),
      })
      .from(playlistSongs)
      .innerJoin(songs, eq(playlistSongs.songId, songs.id))
      .where(eq(playlistSongs.playlistId, id));

    const sharesData = await db
      .select({
        id: playlistShares.id,
        userId: playlistShares.userId,
      })
      .from(playlistShares)
      .where(eq(playlistShares.playlistId, id));

    const [owner] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        avatarUrl: users.avatarUrl,
        isAdmin: users.isAdmin,
      })
      .from(users)
      .where(eq(users.id, playlist.ownerId))
      .limit(1);

    return {
      ...playlist,
      songs: playlistSongsData,
      shares: {
        count: sharesData.length,
      },
      owner,
    };
  }

  async getPlaylists(
    userId?: string,
    filters: IPlaylistFilters = {}
  ): Promise<IDetailedPlaylist[]> {
    const { name, isPublic, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;
  
    const whereConditions: SQL[] = [];
    if (name) {
      whereConditions.push(sql`${playlists.name} ILIKE ${`%${name}%`}`);
    }
    if (isPublic !== undefined) {
      whereConditions.push(eq(playlists.isPublic, isPublic));
    }
  
    const playlistsResult = await db
      .select({
        id: playlists.id,
        name: playlists.name,
        ownerId: playlists.ownerId,
        isPublic: playlists.isPublic,
        createdAt: playlists.createdAt,
        imgUrl: playlists.imgUrl,
        isLikedByUser: sql<boolean>`
          CASE WHEN EXISTS (
            SELECT 1 FROM ${playlistLikes}
            WHERE ${playlistLikes.playlistId} = ${playlists.id}
            AND ${playlistLikes.userId} = ${userId}
          ) THEN true ELSE false END
        `.as("isLikedByUser"),
      })
      .from(playlists)
      .where(and(...whereConditions))
      .limit(limit)
      .offset(offset);
  
    const detailedPlaylists = await Promise.all(
      playlistsResult.map(async (playlist) => {
        const playlistSongsData = await db
          .select({
            id: songs.id,
            youtubeId: songs.youtubeId,
            title: songs.title,
            artist: songs.artist,
            thumbnail: songs.thumbnail,
            duration: songs.duration,
            isLikedByUser: sql<boolean>`
              CASE WHEN EXISTS (
                SELECT 1 FROM ${songLikes}
                WHERE ${songLikes.songId} = ${songs.id}
                AND ${songLikes.userId} = ${userId}
              ) THEN true ELSE false END
            `.as("isLikedByUser"),
          })
          .from(playlistSongs)
          .innerJoin(songs, eq(playlistSongs.songId, songs.id))
          .where(eq(playlistSongs.playlistId, playlist.id));
  
        const sharesData = await db
          .select({
            id: playlistShares.id,
            userId: playlistShares.userId,
          })
          .from(playlistShares)
          .where(eq(playlistShares.playlistId, playlist.id));
  
        const [owner] = await db
          .select({
            id: users.id,
            username: users.username,
            email: users.email,
            avatarUrl: users.avatarUrl,
            isAdmin: users.isAdmin,
          })
          .from(users)
          .where(eq(users.id, playlist.ownerId))
          .limit(1);
  
        return {
          ...playlist,
          songs: playlistSongsData,
          shares: {
            count: sharesData.length,
          },
          owner,
        };
      })
    );
  
    return detailedPlaylists;
  }

  async updatePlaylist(
    id: string,
    updateData: Partial<IPlaylist>
  ): Promise<IPlaylist | null> {
    const [updatedPlaylist] = await db
      .update(playlists)
      .set(updateData)
      .where(eq(playlists.id, id))
      .returning();
    return updatedPlaylist || null;
  }

  async deletePlaylist(id: string): Promise<boolean> {
    const result = await db.delete(playlists).where(eq(playlists.id, id));
    if (!result.rowCount) return false;
    return result?.rowCount > 0;
  }

  async addSongToPlaylist(
    playlistId: string,
    songId: string
  ): Promise<boolean> {
    const result = await db
      .insert(playlistSongs)
      .values({ playlistId, songId });
    if (!result.rowCount) return false;
    return result.rowCount > 0;
  }

  async removeSongFromPlaylist(
    playlistId: string,
    songId: string
  ): Promise<boolean> {
    const result = await db
      .delete(playlistSongs)
      .where(
        and(
          eq(playlistSongs.playlistId, playlistId),
          eq(playlistSongs.songId, songId)
        )
      );

    if (!result.rowCount) return false;
    return result.rowCount > 0;
  }

  async getUserPlaylists(
    userId: string,
    filters: IPlaylistFilters = {}
  ): Promise<{ playlists: IPlaylist[]; total: number }> {
    const { name, isPublic, page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    const whereConditions: SQL[] = [eq(playlists.ownerId, userId)];

    if (name) {
      whereConditions.push(sql`${playlists.name} ILIKE ${`%${name}%`}`);
    }

    if (isPublic !== undefined) {
      whereConditions.push(eq(playlists.isPublic, isPublic));
    }

    const [playlistsResult, countResult] = await Promise.all([
      db
        .select()
        .from(playlists)
        .where(and(...whereConditions))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(playlists)
        .where(and(...whereConditions)),
    ]);

    return {
      playlists: playlistsResult,
      total: Number(countResult[0].count),
    };
  }

  async togglePlaylistLike(
    playlistId: string,
    userId: string
  ): Promise<boolean> {
    const existingLike = await db
      .select()
      .from(playlistLikes)
      .where(
        and(
          eq(playlistLikes.playlistId, playlistId),
          eq(playlistLikes.userId, userId)
        )
      )
      .limit(1);
    if (!existingLike) {
      return false;
    }

    let result;
    if (existingLike.length > 0) {
      result = await db
        .delete(playlistLikes)
        .where(
          and(
            eq(playlistLikes.playlistId, playlistId),
            eq(playlistLikes.userId, userId)
          )
        );
    } else {
      result = await db.insert(playlistLikes).values({ playlistId, userId });
      if (!result.rowCount) return false;
    }
    return true;
  }

  async sharePlaylist(playlistId: string, userId: string): Promise<boolean> {
    const existingShare = await db
      .select()
      .from(playlistShares)
      .where(
        and(
          eq(playlistShares.playlistId, playlistId),
          eq(playlistShares.userId, userId)
        )
      )
      .limit(1);

    if (existingShare.length) {
      return false;
    }

    const result = await db
      .insert(playlistShares)
      .values({ playlistId, userId });

    if (result.rowCount === 0) {
      throw new Error("Failed to insert playlist share");
    }

    return true;
  }
}

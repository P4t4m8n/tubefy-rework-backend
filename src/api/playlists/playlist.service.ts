import { and, eq, SQL, sql } from "drizzle-orm";
import {
  IPlaylist,
  IDetailedPlaylist,
  IPlaylistFilters,
  IPlaylistDTO,
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
import { IUser } from "../users/user.model";
import { ISong } from "../songs/song.model";
import { Genres } from "../songs/song.enum";
import { PlaylistType } from "./playlist.enum";

export class PlaylistService {
  async createPlaylist(
    playlistData: Omit<IPlaylistDTO, "id">
  ): Promise<IPlaylist> {
    const [newPlaylist] = await db
      .insert(playlists)
      .values(playlistData)
      .returning();

    const updatedPlaylist = {
      ...newPlaylist,
      type: newPlaylist.type as PlaylistType,
    };
    return updatedPlaylist;
  }

  async getPlaylistById(
    id: string,
    currentUserId?: string
  ): Promise<IDetailedPlaylist | null> {
  
    // Query to check if the playlist is liked by the user
    const query = sql<boolean>`
      CASE 
        WHEN EXISTS (
          SELECT 1 
          FROM ${playlistLikes}
          WHERE ${playlistLikes.playlistId} = ${id}
            AND ${playlistLikes.userId} = ${currentUserId ?? null}
        )
        THEN TRUE
        ELSE FALSE
      END
    `.as('isLikedByUser');
  
    // Fetch the playlist data along with the liked status
    const [playlist] = await db
      .select({
        id: playlists.id,
        name: playlists.name,
        ownerId: playlists.ownerId,
        isPublic: playlists.isPublic,
        createdAt: playlists.createdAt,
        imgUrl: playlists.imgUrl,
        type: playlists.type,
        isLikedByUser: query,
      })
      .from(playlists)
      .where(eq(playlists.id, id))
      .limit(1);
        
    if (!playlist) return null;
  
    // Fetch songs data related to the playlist
    const playlistSongsData = await db
      .select({
        id: songs.id,
        youtubeId: songs.youtubeId,
        name: songs.name,
        artist: songs.artist,
        thumbnail: songs.thumbnail,
        duration: songs.duration,
        genres: songs.genres,
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
            AND ${songLikes.userId} = ${currentUserId ?? null}
          ) THEN true ELSE false END
        `.as("isLikedByUser"),
      })
      .from(playlistSongs)
      .innerJoin(songs, eq(playlistSongs.songId, songs.id))
      .where(eq(playlistSongs.playlistId, id));
  
    const fixedPlaylistsSongs = playlistSongsData.map((song) => ({
      ...song,
      genres: song.genres as Genres[],
    }));
  
    // Fetch shares data
    const sharesData = await db
      .select({
        id: playlistShares.id,
        userId: playlistShares.userId,
      })
      .from(playlistShares)
      .where(eq(playlistShares.playlistId, id));
  
    // Fetch the owner data
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
  
    // Remove ownerId from the playlist object
    delete (playlist as { ownerId?: string }).ownerId;
  
    return {
      ...playlist,
      songs: fixedPlaylistsSongs,
      shares: {
        count: sharesData.length,
      },
      owner,
      duration: this.getTotalDuration(fixedPlaylistsSongs),
      type: playlist.type as PlaylistType,
    };
  }
  

  async getPlaylists(
    userId?: string,
    filters: IPlaylistFilters = {}
  ): Promise<IDetailedPlaylist[]> {
    try {
      const {
        name,
        isPublic,
        page = 1,
        limit = 76,
        ownerId,
        artist,
        genres,
      } = filters;
      const offset = (page - 1) * limit;
  
      const whereConditions: SQL[] = [];
      if (name) {
        whereConditions.push(sql`${playlists.name} ILIKE ${`%${name}%`}`);
      }
      if (isPublic !== undefined) {
        whereConditions.push(eq(playlists.isPublic, isPublic));
      }
      if (ownerId) {
        whereConditions.push(eq(playlists.ownerId, ownerId));
      }
  
      const playlistSongSubquery = db
        .select({
          playlistId: playlistSongs.playlistId,
        })
        .from(playlistSongs)
        .innerJoin(songs, eq(playlistSongs.songId, songs.id))
        .where(and(
          artist ? sql`${songs.artist} ILIKE ${`%${artist}%`}` : sql`true`,
          genres && genres.length ? sql`${songs.genres} @> ${genres}` : sql`true`
        ))
        .groupBy(playlistSongs.playlistId);
  
      const playlistsResult = await db
        .select({
          id: playlists.id,
          name: playlists.name,
          ownerId: playlists.ownerId,
          isPublic: playlists.isPublic,
          createdAt: playlists.createdAt,
          imgUrl: playlists.imgUrl,
          type: playlists.type,
          isLikedByUser: sql<boolean>`
          CASE WHEN EXISTS (
            SELECT 1 FROM ${playlistLikes}
            WHERE ${playlistLikes.playlistId} = ${playlists.id}
            AND ${playlistLikes.userId} = ${userId ?? null}
          ) THEN true ELSE false END
        `.as("isLikedByUser"),
        })
        .from(playlists)
        .where(and(
          ...whereConditions,
          sql`${playlists.id} IN (${playlistSongSubquery})`
        ))
        .limit(limit)
        .offset(offset);
  
      const detailedPlaylists = await Promise.all(
        playlistsResult.map(async (playlist) => {
          const playlistSongsData = await db
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
            .from(playlistSongs)
            .innerJoin(songs, eq(playlistSongs.songId, songs.id))
            .where(eq(playlistSongs.playlistId, playlist.id));
  
          const fixedPlaylistsSongs = playlistSongsData.map((song) => ({
            ...song,
            genres: song.genres as Genres[],
          }));
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
            songs: fixedPlaylistsSongs,
            shares: {
              count: sharesData.length,
            },
            owner,
            duration: this.getTotalDuration(fixedPlaylistsSongs),
            type: playlist.type as PlaylistType,
          };
        })
      );
  
      return detailedPlaylists;
    } catch (error) {
      console.error("Error in getPlaylists function:", error);
      throw error;
    }
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

    const fixedPlaylist = {
      ...updatedPlaylist,
      type: updatedPlaylist.type as PlaylistType,
    };
    return fixedPlaylist || null;
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

    const fixedPlaylistsResults = playlistsResult.map((playlist) => ({
      ...playlist,
      type: playlist.type as PlaylistType,
    }));

    return {
      playlists: fixedPlaylistsResults,
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

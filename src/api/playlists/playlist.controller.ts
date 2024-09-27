import { Request, Response } from "express";
import {
  IPlaylistDTO,
  IPlaylistFilters,
  TPlaylistType,
} from "./playlist.model";
import { asyncLocalStorage } from "../../middlewares/setupALs.middleware";
import { loggerService } from "../../services/logger.service";
import { EGenres } from "../song/song.enum";
import { songService } from "../song/song.service";
import { playlistService } from "./playlist.service";
import { emitToUser } from "../../services/socket.service";
import { notificationService } from "../notification/notification.service";
import {
  userSharedPlaylistWithYou,
  youSharedPlaylist,
} from "../notification/notificationText";
import { fetchUserCountry } from "../../services/util";
import { friendService } from "../friends/friends.service";
import { IFriend } from "../friends/friends.model";

export const createPlaylist = async (req: Request, res: Response) => {
  try {
    const store = asyncLocalStorage.getStore();
    const user = store?.loggedinUser;
    const playlistData: IPlaylistDTO = req.body;

    if (!user) {
      loggerService.error("Unauthorized to create playlist", { user });
      return res
        .status(403)
        .json({ message: "Unauthorized to create playlist" });
    }

    const newPlaylist = await playlistService.create(playlistData, user);
    return res.status(201).json(newPlaylist);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Failed to create playlist", error });
  }
};

export const getPlaylistById = async (req: Request, res: Response) => {
  try {
    const store = asyncLocalStorage.getStore();

    const { id } = req.params;
    const userId = store?.loggedinUser?.id;

    if (!id) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }

    const playlist = await playlistService.getById(id, userId);

    if (!playlist) {
      loggerService.error("Playlist not found", { id });
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.type === "Liked Songs") {
      if (!playlist.isPublic) {
        if (playlist.owner.id !== userId) {
          return res
            .status(403)
            .json({ message: "Unauthorized to view playlist" });
        }
      }
      playlist.songs = await songService.getLikedSongs(playlist.owner.id!);
    }

    return res.json(playlist);
  } catch (error) {
    loggerService.error("Failed to retrieve playlist", error as Error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve playlist", error });
  }
};

export const getPlaylists = async (req: Request, res: Response) => {
  try {
    const filter: IPlaylistFilters = {
      name: (req.query.name as string) || "",
      isPublic: !!req.query.isPublic || true,
      limit: req?.query?.limit ? +req.query.limit : 100,
      ownerId: (req.query.ownerId as string) || "",
      artist: (req.query.artist as string) || "",
      genres: (req.query.genres as EGenres[]) || [],
      isLikedByUser: !!req.query.isLikedByUser || false,
    };

    const store = asyncLocalStorage.getStore();

    const id = store?.loggedinUser?.id;

    const playlists = await playlistService.query(id, filter);
    return res.json(playlists);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve playlists", error });
  }
};

export const getDefaultPlaylists = async (req: Request, res: Response) => {
  try {
    const ip = req.headers["x-forwarded-for"];

    const country = await fetchUserCountry(ip as string);

    const store = asyncLocalStorage.getStore();
    const user = store?.loggedinUser;

    let friends: IFriend[] = [];
    let randomPlaylistAmount = 8;

    if (user && user.id) {
      friends = await friendService.query(user.id, "ACCEPTED", 5);
      randomPlaylistAmount = 7;
    }
    const playlistsTypes = getRandomPlaylistTypes(randomPlaylistAmount);

    const playlists = await playlistService.queryDefaultPlaylists(
      playlistsTypes,
      friends,
      country,
      user?.id
    );

    res.status(200).send(playlists);
  } catch (error) {
    loggerService.error("Failed to retrieve default playlist", error as Error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve default playlist", error });
  }
};

export const updatePlaylist = async (req: Request, res: Response) => {
  try {
    const store = asyncLocalStorage.getStore();
    const user = store?.loggedinUser;
    const playlistData: IPlaylistDTO = req.body;
    const { id } = req.params;

    if (!user || !user?.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update playlist" });
    }

    const updatedPlaylist = await playlistService.update(id, playlistData);

    return res.json(updatedPlaylist);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update playlist", error });
  }
};

export const deletePlaylist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }

    const result = await playlistService.remove(id);

    if (!result) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    return res.json({ message: "Playlist deleted successfully" });
  } catch (error) {
    loggerService.error("Failed to delete playlist", error as Error);
    return res
      .status(500)
      .json({ message: "Failed to delete playlist", error });
  }
};

export const addSongToPlaylist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    const { username, id: userId } =
      asyncLocalStorage.getStore()?.loggedinUser!;

    if (!id) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }

    if (!songId) {
      return res.status(400).json({ message: "Song ID is required" });
    }

    const result = await playlistService.addSongToPlaylist(id, songId);
    if (!result) {
      return res
        .status(404)
        .json({ message: "Failed to add song to playlist" });
    }

    const playlistName = result.playlist.name;
    const songName = result.song.name;
    const text = `${username} added a ${songName} to ${playlistName}`;

    const users = await playlistService.fetchSharedUserToPlaylists(id, userId);
    users.forEach(async (user) => {
      const notification = await notificationService.create({
        userId: user.id,
        fromUserId: userId!,
        type: "PLAYLIST_SONG_ADD",
        text,
        playlistId: id,
        songId,
      });
      emitToUser(user.id, "addSongToPlaylist", notification);
    });

    return res.json({ message: "Song added to playlist successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to add song to playlist", error });
  }
};

export const removeSongFromPlaylist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isPublic, isOwnerId, songId } = req.body;

    if (!isPublic) {
      const store = asyncLocalStorage.getStore();

      const userId = store?.loggedinUser?.id;
      if (isOwnerId !== userId) {
        return res
          .status(403)
          .json({ message: "Unauthorized to add song to playlist" });
      }
    }

    if (!id) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }

    if (!songId) {
      return res.status(400).json({ message: "Song ID is required" });
    }

    const result = await playlistService.removeSongFromPlaylist(id, songId);

    if (!result) {
      return res
        .status(404)
        .json({ message: "Failed to remove song from playlist" });
    }

    return res.json({ message: "Song removed from playlist successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to remove song from playlist", error });
  }
};

export const getUserPlaylists = async (req: Request, res: Response) => {
  const store = asyncLocalStorage.getStore();
  try {
    const user = store?.loggedinUser;
    if (!user) {
      return res
        .status(403)
        .json({ message: "Unauthorized to get user playlists" });
    }

    const { id } = user;
    const ownedPlaylist = await playlistService.query(id, {
      ownerId: id,
    });

    const likedPlaylists = await playlistService.query(id, {
      isLikedByUser: true,
    });

    const likedSongsPlaylist = await playlistService.getUserLikedSongsPlaylist(
      id!
    );

    return res.json({
      likedSongsPlaylist,
      OwnedPlaylist: [...ownedPlaylist, ...likedPlaylists],
    });
  } catch (error) {
    loggerService.error(`Failed to retrieve user playlists`, error as Error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve user playlists", error });
  }
};

export const likePlaylist = async (req: Request, res: Response) => {
  try {
    const store = asyncLocalStorage.getStore();
    const userId = store?.loggedinUser?.id;

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const result = await playlistService.likePlaylist(id, userId);

    if (!result) {
      return res
        .status(404)
        .json({ message: "Failed to toggle like on playlist" });
    }

    return res.json(true);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to toggle like on playlist", error });
  }
};

export const unlikePlaylist = async (req: Request, res: Response) => {
  try {
    const store = asyncLocalStorage.getStore();
    const userId = store?.loggedinUser?.id;

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const result = await playlistService.unlikePlaylist(id, userId);

    if (!result) {
      return res
        .status(404)
        .json({ message: "Failed to toggle like on playlist" });
    }

    return res.json(true);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to toggle like on playlist", error });
  }
};

export const createSharePlaylist = async (req: Request, res: Response) => {
  try {
    const { friendId } = req.body;
    const { id: playlistId } = req.params;
    const store = asyncLocalStorage.getStore();
    const { username, id: userId } = store?.loggedinUser!;

    if (!playlistId) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }

    if (!friendId || !userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const result = await playlistService.saveShare({
      playlistId,
      userId: friendId,
    });

    if (!result) {
      return res.status(404).json({ message: "Failed to share playlist" });
    }
    const friendNotificationPromise = notificationService.create({
      userId: friendId,
      fromUserId: userId,
      type: "PLAYLIST_SHARE",
      text: userSharedPlaylistWithYou(username, result.playlist.name),
      playlistId,
    });

    const userNotificationPromise = notificationService.create({
      userId,
      fromUserId: friendId,
      type: "GENERAL_NOTIFICATION",
      text: youSharedPlaylist(
        result.playlist.name,
        result.share.user.username || ""
      ),
      playlistId,
    });

    const [userNotification, friendNotification] = await Promise.all([
      userNotificationPromise,
      friendNotificationPromise,
    ]);

    emitToUser(friendId, "sharePlaylist", friendNotification);

    return res.json(userNotification);
  } catch (error) {
    loggerService.error("Failed to share playlist", error as Error);
    return res.status(500).json({ message: "Failed to share playlist", error });
  }
};

export const updateSharePlaylist = async (req: Request, res: Response) => {
  try {
    const { friendId, isOpen } = req.body;
    const { playlistId } = req.params;

    const store = asyncLocalStorage.getStore();
    const sessionId = store?.loggedinUser?.id;

    if (!playlistId) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }

    if (!friendId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (isOpen === undefined) {
      return res.status(400).json({ message: "isPublic is required" });
    }

    const result = await playlistService.saveShare({
      playlistId,
      userId: friendId,
      sessionId,
      isOpen,
    });

    if (!result) {
      return res.status(403).json({ message: "Unauthorized to update share" });
    }

    emitToUser(friendId, "isOpenPlaylist", {
      playlistId,
      isOpen,
    });

    return res.json({ message: "Share updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update share", error });
  }
};

export const approveSharePlaylist = async (req: Request, res: Response) => {
  try {
    const { id: playlistId, notificationId } = req.params;
    const store = asyncLocalStorage.getStore();
    const userId = store?.loggedinUser?.id;

    if (!playlistId) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }
    if (!notificationId) {
      return res.status(400).json({ message: "Notification ID is required" });
    }
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const playlist = await playlistService.approveShare({ playlistId, userId });
    await notificationService.remove({ playlistId, userId, notificationId });
    return res.status(200).json(playlist);
  } catch (error) {
    loggerService.error("Failed to approve share", error as Error);
    return res.status(500).json({ message: "Failed to approve share", error });
  }
};

export const removeSharePlaylist = async (req: Request, res: Response) => {
  try {
    const { friendId } = req.body;
    const { playlistId } = req.params;
    const store = asyncLocalStorage.getStore();
    const sessionUser = store?.loggedinUser?.id;

    if (!playlistId) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }

    if (!friendId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!sessionUser) {
      return res.status(403).json({ message: "Unauthorized to remove share" });
    }

    const result = await playlistService.removeShare(playlistId, friendId);

    if (!result) {
      return res.status(403).json({ message: "Unauthorized to remove share" });
    }

    return res.json({ message: "Share removed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to remove share", error });
  }
};

export const rejectSharePlaylist = async (req: Request, res: Response) => {
  try {
    const { id: playlistId, notificationId } = req.params;

    const store = asyncLocalStorage.getStore();
    const userId = store?.loggedinUser?.id;

    if (!playlistId) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const playlist = await playlistService.removeShare(playlistId, userId);
    await notificationService.remove({ playlistId, userId, notificationId });
    return res.status(200).json(playlist);
  } catch (error) {
    return res.status(500).json({ message: "Failed to approve share", error });
  }
};

const getRandomPlaylistTypes = (count: number): TPlaylistType[] => {
  const types: TPlaylistType[] = [
    "New Music",
    "Chill",
    "Workout",
    "Party",
    "Sleep",
    "Travel",
    "Cooking",
    "Study",
    "New Wave",
    "Other",
    "Popular",
    "Charts",
    "Decades",
    "Mood",
    "Live",
    "Driving",
    "Coding",
  ];

  const randomTypes: TPlaylistType[] = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * types.length);
    randomTypes.push(types[randomIndex]);
    types.splice(randomIndex, 1);
  }

  return randomTypes;
};

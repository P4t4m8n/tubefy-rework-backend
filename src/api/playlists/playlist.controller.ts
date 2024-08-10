import { Request, Response } from "express";
import { PlaylistService } from "./playlist.service";
import {
  IPlaylist,
  IPlaylistCreateDTO,
  IPlaylistFilters,
  IPlaylistUpdateDTO,
} from "./playlist.model";
import { asyncLocalStorage } from "../../middlewares/setupALs.middleware";
import { loggerService } from "../../services/logger.service";
import { Genres } from "../songs/song.enum";

const playlistService = new PlaylistService();

export const createPlaylist = async (req: Request, res: Response) => {
  try {
    const store = asyncLocalStorage.getStore();
    const user = store?.loggedinUser;
    const playlistData: IPlaylistUpdateDTO = req.body;

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
      genres: (req.query.genres as Genres[]) || [],
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

export const updatePlaylist = async (req: Request, res: Response) => {
  try {
    const store = asyncLocalStorage.getStore();
    const user = store?.loggedinUser;
    const playlistData: IPlaylist = req.body;

    if (user) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update playlist" });
    }

    const updatedPlaylist = await playlistService.update(
      user!.id!,
      playlistData
    );

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
    return res
      .status(500)
      .json({ message: "Failed to delete playlist", error });
  }
};

export const addSongToPlaylist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { songId, isPublic, ownerId } = req.body;

    if (!isPublic) {
      const store = asyncLocalStorage.getStore();

      const userId = store?.loggedinUser?.id;
      if (ownerId !== userId) {
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

    const result = await playlistService.addSongToPlaylist(id, songId);

    if (!result) {
      return res
        .status(404)
        .json({ message: "Failed to add song to playlist" });
    }

    return res.json({ message: "Song added to playlist successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to add song to playlist", error });
  }
};

export const removeSongFromPlaylist = async (req: Request, res: Response) => {
  try {
    const { id, songId } = req.params;
    const { isPublic, ownerId } = req.body;

    if (!isPublic) {
      const store = asyncLocalStorage.getStore();

      const userId = store?.loggedinUser?.id;
      if (ownerId !== userId) {
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
    
    const ownedPlaylist = await playlistService.query(user.id, {
      ownerId: user.id,
    });

    const likedPlaylists = await playlistService.query(user.id, {
      isLikedByUser: true,
    });

    return res.json([...ownedPlaylist, ...likedPlaylists]);
  } catch (error) {
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

export const sharePlaylist = async (req: Request, res: Response) => {
  try {
    const { playlistId, userId } = req.body;

    if (!playlistId) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const result = await playlistService.sharePlaylist(playlistId, userId);

    if (!result) {
      return res.status(404).json({ message: "Failed to share playlist" });
    }

    return res.json({ message: "Playlist shared successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to share playlist", error });
  }
};

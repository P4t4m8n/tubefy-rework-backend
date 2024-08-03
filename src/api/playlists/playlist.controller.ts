import { Request, Response } from "express";
import { PlaylistService } from "./playlist.service";
import { IPlaylist, IPlaylistFilters } from "./playlist.model";
import { asyncLocalStorage } from "../../middlewares/setupALs.middleware";

const playlistService = new PlaylistService();
const store = asyncLocalStorage.getStore();

export const createPlaylist = async (req: Request, res: Response) => {
  try {
    const playlistData: IPlaylist = req.body;

    if (!playlistData.ownerId) {
      throw new Error("Owner ID is required");
    }

    const newPlaylist = await playlistService.createPlaylist(playlistData);
    return res.status(201).json(newPlaylist);
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Failed to create playlist", error });
  }
};

export const getPlaylistById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = store?.loggedinUser?.id;

    if (!id) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }

    const playlist = await playlistService.getPlaylistById(id, userId);

    if (!playlist) {
      res.status(404).json({ message: "Playlist not found" });
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve playlist", error });
  }
};

export const getPlaylists = async (req: Request, res: Response) => {
  console.log("req:", req)
  try {
    const filter: IPlaylistFilters = req.body;
    const id = store?.loggedinUser?.id;

    const playlists = await playlistService.getPlaylists(id, filter);

    return res.json(playlists);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve playlists", error });
  }
};

export const updatePlaylist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const playlistData: Partial<IPlaylist> = req.body;

    if (!playlistData.isPublic) {
      const userId = store?.loggedinUser?.id;
      if (playlistData.ownerId !== userId) {
        return res
          .status(403)
          .json({ message: "Unauthorized to update playlist" });
      }
    }

    if (!id) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }

    const updatedPlaylist = await playlistService.updatePlaylist(
      id,
      playlistData
    );

    res.json(updatedPlaylist);
  } catch (error) {
    res.status(500).json({ message: "Failed to update playlist", error });
  }
};

export const deletePlaylist = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }

    const result = await playlistService.deletePlaylist(id);

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
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const playlists = await playlistService.getUserPlaylists(userId);

    return res.json(playlists);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve user playlists", error });
  }
};

export const toggleLikePlaylist = async (req: Request, res: Response) => {
  try {
    const userId = store?.loggedinUser?.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Playlist ID is required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const result = await playlistService.togglePlaylistLike(id, userId);

    if (!result) {
      return res
        .status(404)
        .json({ message: "Failed to toggle like on playlist" });
    }

    return res.json({ message: "Like toggled successfully" });
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

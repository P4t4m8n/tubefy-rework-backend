import { asyncLocalStorage } from "../../middlewares/setupALs.middleware";
import { loggerService } from "../../services/logger.service";
import { playlistService } from "../playlists/playlist.service";
import { SongService } from "./song.service";
import { Request, Response } from "express";

const songServices = new SongService();

export const createSong = async (req: Request, res: Response) => {
  try {
    const store = asyncLocalStorage.getStore();
    const { song, playlistId } = req.body;
    const user = store?.loggedinUser;

    if (!user) {
      return res.status(403).json({ message: "Unauthorized to create song" });
    }

    const newSong = await songServices.create(song, user);
    await playlistService.addSongToPlaylist(playlistId, newSong.id);

    return res.status(201).json(newSong);
  } catch (error) {
    loggerService.error("Failed to create song", error as Error);
    return res.status(400).json({ message: "Failed to create song", error });
  }
};

export const likeSong = async (req: Request, res: Response) => {
  try {
    const store = asyncLocalStorage.getStore();
    const { id } = req.params;
    const userId = store?.loggedinUser?.id;

    if (!id) {
      return res.status(400).json({ message: "Song ID is required" });
    }
    if (!userId) {
      return res.status(403).json({ message: "Unauthorized to like song" });
    }

    const likedSong = await songServices.likeSong(id, userId);

    return res.json(likedSong);
  } catch (error) {
    loggerService.error("Failed to toggle like song", error as Error);
    return res
      .status(500)
      .json({ message: "Failed to toggle like song", error });
  }
};

export const unlikeSong = async (req: Request, res: Response) => {
  try {
    const store = asyncLocalStorage.getStore();
    const { id } = req.params;
    const userId = store?.loggedinUser?.id;

    if (!id) {
      return res.status(400).json({ message: "Song ID is required" });
    }
    if (!userId) {
      return res.status(403).json({ message: "Unauthorized to unlike song" });
    }

    const unlikeSong = await songServices.unlikeSong(id, userId);

    return res.json(unlikeSong);
  } catch (error) {
    loggerService.error("Failed to toggle unlike song", error as Error);
    return res
      .status(500)
      .json({ message: "Failed to toggle unlike song", error });
  }
};

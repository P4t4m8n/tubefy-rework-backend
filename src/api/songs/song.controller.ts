import { asyncLocalStorage } from "../../middlewares/setupALs.middleware";
import { loggerService } from "../../services/logger.service";
import { SongService } from "./song.service";
import { Request, Response } from "express";

const songServices = new SongService();

export const toggleLikeSong = async (req: Request, res: Response) => {
  try {
    const store = asyncLocalStorage.getStore();
    const { id } = req.params;
    console.log("songId:", id)
    const userId = store?.loggedinUser?.id;
    console.log("userId:", userId)

    if (!id) {
      return res.status(400).json({ message: "Song ID is required" });
    }
    if (!userId) {
      return res.status(403).json({ message: "Unauthorized to like song" });
    }

    const likedSong = await songServices.toggleLike(id, userId);

    res.json(likedSong);
  } catch (error) {
    loggerService.error("Failed to toggle like song", error as Error);
    res.status(500).json({ message: "Failed to toggle like song", error });
  }
};

import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getPlaylists,
  likePlaylist,
  removeSongFromPlaylist,
  createSharePlaylist,
  unlikePlaylist,
  updatePlaylist,
  updateSharePlaylist,
  removeSharePlaylist,
  approveSharePlaylist,
  rejectSharePlaylist,
} from "./playlist.controller";
import { log } from "../../middlewares/logger.middleware";

export const playlistRoutes = express.Router();

playlistRoutes.post("/edit", requireAuth, log, createPlaylist);
playlistRoutes.put("/edit/:id", requireAuth, log, updatePlaylist);

playlistRoutes.post("/:id/songs", requireAuth, log, addSongToPlaylist);
playlistRoutes.delete("/:id/songs", requireAuth, log, removeSongFromPlaylist);

playlistRoutes.post("/:id/like", requireAuth, log, likePlaylist);
playlistRoutes.delete("/:id/like", requireAuth, log, unlikePlaylist);

playlistRoutes.get("/:id", log, getPlaylistById);
playlistRoutes.delete("/:id", requireAuth, log, deletePlaylist);
playlistRoutes.get("/", log, getPlaylists);

playlistRoutes.post("/:id/share", requireAuth, log, createSharePlaylist);
playlistRoutes.put("/:id/share", requireAuth, log, updateSharePlaylist);
playlistRoutes.put(
  "/:id/share/:notificationId",
  requireAuth,
  log,
  approveSharePlaylist
);
playlistRoutes.delete(
  "/:id/share/:notificationId",
  requireAuth,
  log,
  rejectSharePlaylist
);
playlistRoutes.delete("/:id/share", requireAuth, log, removeSharePlaylist);

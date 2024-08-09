import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getPlaylists,
  getUserPlaylists,
  likePlaylist,
  removeSongFromPlaylist,
  unlikePlaylist,
  updatePlaylist,
} from "./playlist.controller";
import { log } from "../../middlewares/logger.middleware";

export const playlistRoutes = express.Router();

playlistRoutes.post("/edit", requireAuth, log, createPlaylist);
playlistRoutes.put("/edit/:id", requireAuth, log, updatePlaylist);

playlistRoutes.post("/:id/songs", log, addSongToPlaylist);
playlistRoutes.delete("/:id/songs", log, removeSongFromPlaylist);

playlistRoutes.post("/:id/like", requireAuth, log, likePlaylist);
playlistRoutes.delete("/:id/like", requireAuth, log, unlikePlaylist);

playlistRoutes.get("/user", requireAuth, log, getUserPlaylists);

playlistRoutes.get("/:id", log, getPlaylistById);
playlistRoutes.delete("/:id", requireAuth, log, deletePlaylist);
playlistRoutes.get("/", log, getPlaylists);

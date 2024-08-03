import express from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getPlaylists,
  getUserPlaylists,
  removeSongFromPlaylist,
  toggleLikePlaylist,
  updatePlaylist,
} from "./playlist.controller";
import { log } from "../../middlewares/logger.middleware";

export const playlistRoutes = express.Router();

playlistRoutes.post("/", requireAuth, log, createPlaylist);
playlistRoutes.get("/:id", log, getPlaylistById);
playlistRoutes.get("/", log, getPlaylists);
playlistRoutes.put("/:id", requireAuth, log, updatePlaylist);
playlistRoutes.delete("/:id", requireAuth, log, deletePlaylist);
playlistRoutes.post("/:id/songs", log, addSongToPlaylist);
playlistRoutes.delete("/:id/songs/:songId", log, removeSongFromPlaylist);
playlistRoutes.get("/user/:userId", log, getUserPlaylists);
playlistRoutes.post("/like/:id", requireAuth, log, toggleLikePlaylist);

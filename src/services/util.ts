import { PlaylistType } from "../api/playlists/playlist.enum";
import { IPlaylistCreateDTO } from "../api/playlists/playlist.model";

export const getDefaultLikesPlaylist = (
  ownerId: string
): IPlaylistCreateDTO => {
  return {
    name: "Liked Songs",
    isPublic: false,
    ownerId,
    imgUrl:
      "https://res.cloudinary.com/dpnevk8db/image/upload/v1705451341/playlist-like.png",
    types: [PlaylistType.LIKED_SONGS],
    genres: [],
  };
};

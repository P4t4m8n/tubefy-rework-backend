import { IPlaylistDTO } from "../api/playlists/playlist.model";

export const getDefaultLikesPlaylist = (
  ownerId: string
): IPlaylistDTO => {
  return {
    name: "Liked Songs",
    isPublic: false,
    ownerId,
    imgUrl:
      "https://res.cloudinary.com/dpnevk8db/image/upload/v1705451341/playlist-like.png",
    types: ["Liked Songs"],
    genres: [],
    createdAt: new Date(),
  };
};

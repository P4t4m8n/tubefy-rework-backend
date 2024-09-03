export const youSharedPlaylist = (
  playlistName: string = "Playlist",
  friendName: string = "User"
) => `You shared playlist ${playlistName} with ${friendName}`;

export const userSharedPlaylistWithYou = (
  username: string = "User",
  playlistName: string = "PLaylist"
) => `${username} shared playlist ${playlistName} with you`;

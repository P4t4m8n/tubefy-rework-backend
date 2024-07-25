export interface ISong {
  id: number;
  youtubeId: string;
  title: string;
  artist: string | null;
  thumbnail: string | null;
  duration: number | null;
}

export interface IPlaylistSong {
  id: number;
  playlistId: number;
  songId: number;
  addedAt: Date;
}

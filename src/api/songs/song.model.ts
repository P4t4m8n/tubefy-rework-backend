export interface ISong {
  id: string;
  youtubeId: string;
  title: string;
  artist: string | null;
  thumbnail: string | null;
  duration: number | null;
  isLikeByUser?: boolean;
}

export interface IPlaylistSong {
  id: string;
  playlistId: number;
  songId: number;
  addedAt: Date;
}

export type TSocketEvent =
  | "sharePlaylist"
  | "sendFriendRequest"
  | "rejectFriendRequest"
  | "approveFriendRequest"
  | "blockFriendRequest"
  | "removeFriendRequest";

interface SharePlaylistPayload {
  friendId: string;
  playlistId: string;
}

interface FriendRequestPayload {
  fromUserId: string;
  toUserId: string;
}

interface SocketEventPayloads {
  sharePlaylist: SharePlaylistPayload;
  friendRequest: FriendRequestPayload;
}

export type TSocketEvent = TSocketEventShare | TSocketEventFriend;

export type TSocketEventShare =
  | "sharePlaylist"
  | "isOpenPlaylist"
  | "joinPlaylist"
  | "leavePlaylist";

export type TSocketEventFriend =
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

export type TSocketEvent = TSocketEventShare | TSocketEventFriend;

export type TSocketEventShare =
  | "sharePlaylist"
  | "isOpenPlaylist"
  | "joinPlaylist"
  | "leavePlaylist"
  | "addSongToPlaylist";

export type TSocketEventFriend =
  | "sendFriendRequest"
  | "rejectFriendRequest"
  | "approveFriendRequest"
  | "blockFriendRequest"
  | "removeFriendRequest";





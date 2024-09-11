export interface IFriendSqlLogic {
  select: {
    id: boolean;
    status: boolean;
    createdAt: boolean;
    friend: {
      select: {
        id: boolean;
        username: boolean;
        isAdmin: boolean;
        imgUrl: boolean;
      };
    };
  };
}

export interface ISongSmallSqlLogic {
  select: {
    id: boolean;
    youtubeId: boolean;
    name: boolean;
    imgUrl: boolean;
    itemType: boolean;
  };
}

export interface ISongSqlLogic {
  select: {
    id: boolean;
    name: boolean;
    artist: boolean;
    imgUrl: boolean;
    duration: boolean;
    genres: boolean;
    youtubeId: boolean;
    addedAt: boolean;
    addedBy: {
      select: {
        id: boolean;
        imgUrl: boolean;
        username: boolean;
      };
    };
    songLikes: {
      where: {
        userId: string;
      };
      select: {
        id: boolean;
      };
    };
  };
}

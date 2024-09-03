export const songSmallSqlLogic = {
  select: {
    id: true,
    youtubeId: true,
    name: true,
    imgUrl: true,
    itemType: true,
  },
};

export const getSongSqlLogic = (userId: string) => {
  return {
    select: {
      id: true,
      name: true,
      artist: true,
      imgUrl: true,
      duration: true,
      genres: true,
      youtubeId: true,
      addedAt: true,
      addedBy: {
        select: {
          id: true,
          imgUrl: true,
          username: true,
        },
      },
      songLikes: {
        where: {
          userId: userId,
        },
        select: {
          id: true,
        },
      },
    },
  };
};

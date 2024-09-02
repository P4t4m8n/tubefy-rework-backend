export const playlistShareSqlLogic = () => {
  return {
    id: true,
    playlistId: true,
    isOpen: true,
    user: {
      select: {
        id: true,
        imgUrl: true,
        username: true,
      },
    },
  };
};

export const playlistSmallSqlLogic = {
  select: {
    id: true,
    name: true,
    imgUrl: true,
    isPublic: true,
    itemType: true,
  },
};

import {
  IPlaylistDTO,
  PLAYLISTS_TYPES,
  TPlaylistType,
} from "../api/playlists/playlist.model";
import { IUserDTO } from "../api/users/user.model";
import { loggerService } from "./logger.service";

export const getDefaultLikesPlaylist = (ownerId: string): IPlaylistDTO => {
  return {
    name: "Liked Songs",
    isPublic: false,
    ownerId,
    imgUrl:
      "https://res.cloudinary.com/dpnevk8db/image/upload/v1705451341/playlist-like.png",
    types: ["Liked Songs"],
    genres: [],
    createdAt: new Date(),
  };
};

export const fetchUserCountry = async (ip?: string): Promise<string> => {
  try {
    let country = "Israel";

    // if (!ip) {
    //   return country;
    // }

    // const url = `http://api.ipapi.com/api/${ip}?access_key=${process.env.IPAPI_KEY}&output=json`;
    // const fetch_res = await fetch(url);
    // const fetch_data: { counter_name: string } = await fetch_res.json();

    // if (fetch_data.counter_name) {
    //   country = fetch_data.counter_name;
    // }

    return country;
  } catch (error) {
    loggerService.error("Error Getting country from ip", Error);
    return "Israel";
  }
};

export const getRandomPlaylistTypes = (length: number): TPlaylistType[] => {
  const typesArr = [...PLAYLISTS_TYPES];
  if (length > typesArr.length) {
    return typesArr;
  }

  const types: TPlaylistType[] = [];
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * typesArr.length);
    typesArr.splice(randomIndex, 1);
    types.push(typesArr[randomIndex]);
  }

  return types;
};

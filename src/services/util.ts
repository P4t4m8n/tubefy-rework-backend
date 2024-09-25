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
    type: "Liked Songs",
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



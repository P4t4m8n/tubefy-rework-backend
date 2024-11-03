import { ISongDTO } from "../src/api/song/song.model";
import { songService } from "../src/api/song/song.service";
import { IUser } from "../src/api/users/user.model";
import { playlistService } from "../src/api/playlists/playlist.service";
import { authService } from "../src/api/auth/auth.service";
import { getDefaultLikesPlaylist } from "../src/services/util";
import { IPlaylistDTO } from "../src/api/playlists/playlist.model";
import { userService } from "../src/api/users/user.service";
import { friendService } from "../src/api/friends/friends.service";
import { USER_PLAYLIST_NAMES, USERS_DATA } from "./demo-data/users";
import { SONGS_DATA } from "./demo-data/songs";
import {
  PLAYLIST_DATA_SONGS,
  PLAYLISTS_DATA_DTOS,
} from "./demo-data/playlists";
import { prisma } from "./prismaClient";
import fs from "fs";
import { TGenres } from "../src/models/app.model";

async function seed() {
  try {
    const user = await seedAdmin();
    if (!user) {
      throw new Error("Admin user not found");
    }
    await seedSongs(user);
    await seedPlaylists(user);
    await seedPlaylistSong();
    await seedUsers();
    await seedFriends();
    await approveFriendRequests();
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

const seedAdmin = async () => {
  try {
    const { user } = await authService.signUp({
      username: "Artist",
      email: "Artist@Artist.com",
      password: "Aa123456",
    });
    const playlistToCreate = getDefaultLikesPlaylist(user.id!);
    await playlistService.create(playlistToCreate, user);

    return user;
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
};
const seedSongs = async (user: IUser) => {
  try {
    const songs = SONGS_DATA.map((song) => ({
      ...song,
      addByUserId: user.id!,
    }));
    await songService.createMany(songs, user);
  } catch (error) {
    console.error("Error seeding songs:", error);
  }
};

const seedPlaylists = async (user: IUser) => {
  try {
    const playlists = PLAYLIST_DATA_SONGS.map((p) => {
      return {
        name: p.name,
        description: p.description,
        imgUrl: p.imgUrl,
        isPublic: true,
        genres: p.genres,
        type: p.type,
        ownerId: user.id!,
      };
    });
    await playlistService.createMany(playlists, user);
  } catch (error) {
    console.error("Error seeding playlists:", error);
  }
};

const seedPlaylistSong = async () => {
  try {
    const playlists = await playlistService.query();
    const songs = await songService.query({});

    for (const playlist of PLAYLIST_DATA_SONGS) {
      const playlistId = playlists.find((p) => p.name === playlist.name)?.id;
      if (!playlistId) {
        console.error("Playlist not found:", playlist.name);
        continue;
      }

      if (playlist.songs.length === 0) {
        console.info(playlist.name, playlist.id);
      }
      for (const song of playlist.songs) {
        const songId = songs.find((s) => s.youtubeId === song.youtubeId)?.id;
        if (!songId) {
          console.error("Song not found:", song.youtubeId);
          continue;
        }

        await playlistService.addSongToPlaylist(playlistId, songId);
      }
    }
  } catch (error) {
    console.error("Error seeding playlists:", error);
  }
};

const seedUsers = async () => {
  try {
    let idx = 0;
    const songs = await songService.query({});
    for (const _user of USERS_DATA) {
      const { user } = await authService.signUp(_user);
      const playlistToCreate = getDefaultLikesPlaylist(user.id!);
      await playlistService.create(playlistToCreate, user);

      const playlistNames = USER_PLAYLIST_NAMES.slice(idx, idx + 10);
      idx += 10;

      for (const name of playlistNames) {
        let randomNumber = Math.floor(Math.random() * songs.length - 12);
        if (randomNumber < 0) {
          randomNumber = 0;
        }
        const playlistSongs = songs.slice(randomNumber, randomNumber + 10);
        const playlistDto: IPlaylistDTO = {
          imgUrl:
            "https://res.cloudinary.com/dpnevk8db/image/upload/v1727206122/default-playlist_ayxym6.png",
          name,
          ownerId: user.id!,
          isPublic: true,
          type: "User",
          genres: [],
        };
        const playlist = await playlistService.create(playlistDto, user);
        for (const song of playlistSongs) {
          await playlistService.addSongToPlaylist(playlist.id!, song.id!);
        }
      }
    }
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};

const seedFriends = async () => {
  try {
    const usersData = await userService.query();
    const users = usersData.filter((u) => u.username !== "Artist");

    for (const user of users) {
      const friends = users.filter((u) => u.id !== user.id);
      for (const friend of friends) {
        await friendService.create(user.id!, friend.id!);
      }
    }
  } catch (error) {
    console.error("Error seeding friends:", error);
  }
};

const approveFriendRequests = async () => {
  try {
    const friends = await prisma.friend.findMany();
    for (const friend of friends) {
      await friendService.update(friend.id, "ACCEPTED");
    }
  } catch (error) {
    console.error("Error approving friend requests:", error);
  }
};

// File I/O helper functions
const writeData = (data: any, name?: string) => {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const dbFilePath = `db-${name || timestamp}.json`;

    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving file:", error);
  }
};
const readData = (location: string) => {
  try {
    const data = fs.readFileSync(location, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading file:", error);
    return [];
  }
};

// Helper functions
const cleanDuplicationString = (data: string[]): string[] => {
  const cleanData = [];
  const tempData: Array<string | null> = data;

  for (let i = 0; i < tempData.length; i++) {
    if (!tempData[i] || tempData[i] === null) continue;

    for (let j = i + 1; j < tempData.length; j++) {
      if (!tempData[j]) continue;
      if (tempData[i]?.toLowerCase() === tempData[j]?.toLowerCase()) {
        tempData[j] = null;
      }
    }

    cleanData.push(tempData[i] as string);
  }

  return cleanData;
};
const cleanDuplicationByName = <T extends { name: string }>(data: T[]): T[] => {
  const cleanData = [];
  const tempData: Array<T | null> = data;

  for (let i = 0; i < tempData.length; i++) {
    if (!tempData[i] || tempData[i] === null) continue;

    for (let j = i + 1; j < tempData.length; j++) {
      if (!tempData[j]) continue;
      if (tempData[i]?.name.toLowerCase() === tempData[j]?.name.toLowerCase()) {
        tempData[j] = null;
      }
    }

    cleanData.push(tempData[i] as T);
  }

  return cleanData;
};

seed().then(() => {
  try {
    console.info("Seeding done");
  } catch (error) {
    console.error("Error finalizing seeding:", error);
  }
});

export interface IPlaylistSongs extends IPlaylistDTO {
  songs: ISongDTO[];
}

import { notificationService } from "../src/api/notification/notification.service";
import { PlaylistType } from "../src/api/playlists/playlist.enum";
import {
  IPlaylist,
} from "../src/api/playlists/playlist.model";
import { PlaylistService } from "../src/api/playlists/playlist.service";
import { Genres } from "../src/api/songs/song.enum";
import { ISong, ISongDTO } from "../src/api/songs/song.model";
import { SongService } from "../src/api/songs/song.service";
import { IUser, IUserDTO, IUserSignupDTO } from "../src/api/users/user.model";
import { UserService } from "../src/api/users/user.service";
import {
  playlistJson,
  playlistsImgsJson,
  songsJson,
  usersJson,
} from "./demo-data/consts";
import { prisma } from "./prismaClient";

const playlistTypes: PlaylistType[] = Object.values(PlaylistType).splice(0, 7);
const userServices = new UserService();
const playlistsServices = new PlaylistService();
const songService = new SongService();
async function seed() {
  try {

    // // const { users } = await userServices.query();
    // const playlists = await playlistsServices.query();
    // // const songs = await songService.query({});
  

    // let i = 0;
    // for (const playlist of playlists) {
    //   await playlistsServices.update(playlist.id!, {
    //     ...playlist,
    //     imgUrl: playlistsImgsJson[i % 40],
    //   });
    //   i++
    // }

    // //  await seedPlaylists(users[0]);
    // // await seedSongs(users[0]);

    // // await prisma.playlistSong.deleteMany();
    // // await prisma.playlist.deleteMany();
    // // await prisma.user.deleteMany();
    // // await prisma.song.deleteMany();

    // // let j = 0;
    // // for (const playlist of playlists) {
    // //   if (j >= songs.length) {
    // //     j = 0;
    // //   }

    // //   for (let i = j; i < j + 5; i++) {
    // //     if (i < songs.length) {
    // //       await playlistsServices.addSongToPlaylist(playlist.id!, songs[i].id!);
    // //     }
    // //   }

    // //   j += 5;
    // // }
  } catch (error) {
    console.error("Error during seeding:", error);
  }
}

const seedUsers = async (): Promise<IUserDTO[]> => {
  const usersData: IUserSignupDTO[] = usersJson;
  try {
    const users = await Promise.all(
      usersData.map(async (user) => {
        return await userServices.create(user);
      })
    );

    return users;
  } catch (error) {
    console.error("Error seeding users:", error);
    return [];
  }
};

const seedPlaylists = async (user: IUser): Promise<IPlaylist[]> => {
  try {
    const playlistTypes: PlaylistType[] = Object.values(PlaylistType).splice(
      0,
      7
    );

    const genresT: Genres[] = Object.values(Genres);

    const playlistData: IPlaylistUpdateDTO[] = playlistJson.map(
      (playlist, idx) => {
        const genres = genresT.sort(() => 0.5 - Math.random()).slice(0, 4);
        return {
          ...playlist,
          ownerId: user.id!,
          types: [playlistTypes[idx % playlistTypes.length]],
          genres,
        };
      }
    );

    const playlists = await Promise.all(
      playlistData.map(async (playlist) => {
        return await playlistsServices.create(playlist, user);
      })
    );

    console.info("playlists seeds");
    return playlists;
  } catch (error) {
    console.error("Error seeding playlists:", error);
    return [];
  }
};

const seedSongs = async (user: IUser): Promise<ISong[]> => {
  try {
    const songsData: ISongDTO[] = songsJson.map((song) => ({
      ...song,
      addByUserId: user.id!,
      addedAt: convertTimestampToDate(+song.addedAt),
      genres: [],
    }));

    const songs = await Promise.all(
      songsData.map(async (song) => {
        return await songService.create(song, user);
      })
    );
    console.info("songs seeds");
    return songs;
  } catch (error) {
    console.error("Error seeding songs:", error);
    return [];
  }
};

const convertTimestampToDate = (timestamp: number): Date => {
  return new Date(timestamp);
};

seed().then(() => {
  try {
    console.info("Seeding done");
  } catch (error) {
    console.error("Error finalizing seeding:", error);
  }
});

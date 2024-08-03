// import { PlaylistType } from "../api/playlists/playlist.enum";
import { IPlaylist, IPlaylistDTO } from "../api/playlists/playlist.model";
import { PlaylistService } from "../api/playlists/playlist.service";
import { ISong, ISongDTO } from "../api/songs/song.model";
import { SongService } from "../api/songs/song.service";
import { IUser } from "../api/users/user.model";
import { UserService } from "../api/users/user.service";
import { playlistJson, songsJson, usersJson } from "./demo-data/consts";

// const playlistTypes: PlaylistType[] = Object.values(PlaylistType).splice(0, 7);
const userServices = new UserService();
const playlistsServices = new PlaylistService();
const songService = new SongService();
async function seed() {
  try {
    console.log("Seeding started");

    // const users = await seedUsers(usersJson);
    // const { users } = await userServices.getAllUsers();
    // console.log("Seeded users:", users);

    // const playlistsData: IPlaylistDTO[] = playlistJson.map((playlist) => ({
    //   ...playlist,
    //   ownerId: users[0].id!,
    //   isPublic: true,
    // }));

    // const songsData: ISongDTO[] = songsJson.map((song) => ({
    //   ...song,
    //   addByUserId: users[0].id!,
    //   addedAt: convertTimestampToDate(+song.addedAt),
    // }));

    // const playlists = await seedPlaylists(playlistsData);
    // console.log("playlists:", playlists.length);
    // const songs = await seedSongs(songsData);

    // console.log("Seeded playlists:", playlists);
    // console.log("Seeded songs:", songs);

    const [users, playlists, songs] = await Promise.all([
      await userServices.getAllUsers(),
      await playlistsServices.getPlaylists(),
      await songService.get({}),
    ]);

    // for (let i = 0; i < playlists.length - 1; i++) {
    //   const playlist = playlists[i];
    //   const songsToAdd = songs.slice((i * 5) % 145, ((i * 5) % 145) + 5);
    //   songsToAdd.forEach((song) => {
    //     playlistsServices.addSongToPlaylist(playlist.id!, song.id!);
    //   });
    // }
    console.log("playlists:", playlists.length);
  } catch (error) {
    console.error("Error during seeding:", error);
  }
}

const seedUsers = async (usersData: IUser[]): Promise<IUser[]> => {
  try {
    const users = await Promise.all(
      usersData.map(async (user) => {
        return await userServices.createUser(user);
      })
    );

    return users;
  } catch (error) {
    console.error("Error seeding users:", error);
    return [];
  }
};

const seedPlaylists = async (
  playlistsData: IPlaylistDTO[]
): Promise<IPlaylist[]> => {
  try {
    const playlists = await Promise.all(
      playlistsData.map(async (playlist) => {
        return await playlistsServices.createPlaylist(playlist);
      })
    );
    return playlists;
  } catch (error) {
    console.error("Error seeding playlists:", error);
    return [];
  }
};

const seedSongs = async (songsData: ISongDTO[]): Promise<ISong[]> => {
  try {
    const songs = await Promise.all(
      songsData.map(async (song) => {
        console.log("song:", song);
        return await songService.create(song);
      })
    );
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
    console.log("Seeding done");
  } catch (error) {
    console.error("Error finalizing seeding:", error);
  }
});

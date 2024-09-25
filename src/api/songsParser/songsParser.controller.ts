import { Request, Response } from "express";
import { songParserService } from "./songsParser.service";
import { songsJson } from "../../../prisma/demo-data/consts";
import { ISong } from "../song/song.model";
import { SongService } from "../song/song.service";
import { EGenres } from "../song/song.enum";

const songsParserServices = new songParserService();
const songsServices = new SongService();

export const processSongsInBatch = async () => {
  const songs = [
    {
      id: "bd520ff4-3b66-473a-8275-c1cd780b7650",
      youtubeId: "6FOUqQt3Kg0",
      name: "Respect",
      artist: "ArethaFrankl...",
      thumbnail: "https://i.ytimg.com/vi/6FOUqQt3Kg0/mqdefault.jpg",
      genres: [EGenres.OTHER],
      duration: "02:30",
      addBy: {
        id: "12b3c1cb-8f63-42a9-bed2-ef0dbf8adcd6",
        username: "Demo-user-one",

        imgUrl:
          "https://res.cloudinary.com/dpnevk8db/image/upload/v1719231948/avatar4_wmaocu.jpg",
        isAdmin: false,
      },
    },
    {
      id: "6b64ebe3-15d5-42d1-975c-2351221df54a",
      youtubeId: "ZEcqHA7dbwM",
      name: "Fly Me To TheMoon",
      artist: "Frank Sinatra",
      thumbnail: "https://i.ytimg.com/vi/ZEcqHA7dbwM/mqdefault.jpg",
      genres: [EGenres.OTHER],
      duration: "02:28",
      addBy: {
        id: "12b3c1cb-8f63-42a9-bed2-ef0dbf8adcd6",
        username: "Demo-user-one",

        imgUrl:
          "https://res.cloudinary.com/dpnevk8db/image/upload/v1719231948/avatar4_wmaocu.jpg",
        isAdmin: false,
      },
    },
    {
      id: "102c154a-e480-40ef-832b-e8c98c86f9e4",
      youtubeId: "qQzdAsjWGPg",
      name: "My Way",
      artist: "Frank Sinatra",
      thumbnail: "https://i.ytimg.com/vi/qQzdAsjWGPg/mqdefault.jpg",
      genres: [EGenres.OTHER],
      duration: "04:37",
      addBy: {
        id: "12b3c1cb-8f63-42a9-bed2-ef0dbf8adcd6",
        username: "Demo-user-one",

        imgUrl:
          "https://res.cloudinary.com/dpnevk8db/image/upload/v1719231948/avatar4_wmaocu.jpg",
        isAdmin: false,
      },
    },
    {
      id: "ea62bfcc-8427-4fb0-9306-ba737a126951",
      youtubeId: "TnlPtaPxXfc",
      name: "39sLife",
      artist: "That",
      thumbnail: "https://i.ytimg.com/vi/TnlPtaPxXfc/mqdefault.jpg",
      genres: [EGenres.OTHER],
      duration: "03:08",
      addBy: {
        id: "12b3c1cb-8f63-42a9-bed2-ef0dbf8adcd6",
        username: "Demo-user-one",

        imgUrl:
          "https://res.cloudinary.com/dpnevk8db/image/upload/v1719231948/avatar4_wmaocu.jpg",
        isAdmin: false,
      },
    },
    {
      id: "39f7be94-8760-46da-becc-52e29f5e0af8",
      youtubeId: "bnVUHWCynig",
      name: "Halo",
      artist: "Beyonce",
      thumbnail: "https://i.ytimg.com/vi/bnVUHWCynig/mqdefault.jpg",
      genres: [EGenres.OTHER],
      duration: "03:45",
      addBy: {
        id: "12b3c1cb-8f63-42a9-bed2-ef0dbf8adcd6",
        username: "Demo-user-one",

        imgUrl:
          "https://res.cloudinary.com/dpnevk8db/image/upload/v1719231948/avatar4_wmaocu.jpg",
        isAdmin: false,
      },
    },
    {
      id: "67fc1f58-9c19-47e2-a099-fb7ae18868c7",
      youtubeId: "HNBCVM4KbUM",
      name: "ampTheWailer...",
      artist: "BobMarley",
      thumbnail: "https://i.ytimg.com/vi/HNBCVM4KbUM/mqdefault.jpg",
      genres: [EGenres.OTHER],
      duration: "03:13",
      addBy: {
        id: "12b3c1cb-8f63-42a9-bed2-ef0dbf8adcd6",
        username: "Demo-user-one",

        imgUrl:
          "https://res.cloudinary.com/dpnevk8db/image/upload/v1719231948/avatar4_wmaocu.jpg",
        isAdmin: false,
      },
    },
    {
      id: "570d76fd-eb93-4e5b-800a-d3f4ad4d575b",
      youtubeId: "69RdQFDuYPI",
      name: "IsThisLove",
      artist: "BobMarley",
      thumbnail: "https://i.ytimg.com/vi/69RdQFDuYPI/mqdefault.jpg",
      genres: [EGenres.OTHER],
      duration: "03:54",
      addBy: {
        id: "12b3c1cb-8f63-42a9-bed2-ef0dbf8adcd6",
        username: "Demo-user-one",

        imgUrl:
          "https://res.cloudinary.com/dpnevk8db/image/upload/v1719231948/avatar4_wmaocu.jpg",
        isAdmin: false,
      },
    },
    {
      id: "26d59037-1a9b-40ed-95df-7348b4289ae4",
      youtubeId: "uMUQMSXLlHM",
      name: "ampTheWailer...",
      artist: "BobMarley",
      thumbnail: "https://i.ytimg.com/vi/uMUQMSXLlHM/mqdefault.jpg",
      genres: [EGenres.OTHER],
      duration: "02:43",
      addBy: {
        id: "12b3c1cb-8f63-42a9-bed2-ef0dbf8adcd6",
        username: "Demo-user-one",

        imgUrl:
          "https://res.cloudinary.com/dpnevk8db/image/upload/v1719231948/avatar4_wmaocu.jpg",
        isAdmin: false,
      },
    },
    {
      id: "0e53aec9-d945-41af-a1d9-6819087d0929",
      youtubeId: "Y3ywicffOj4",
      name: "Dreams",
      artist: "FleetwoodMac",
      thumbnail: "https://i.ytimg.com/vi/Y3ywicffOj4/mqdefault.jpg",
      genres: [EGenres.OTHER],
      duration: "04:24",
      addBy: {
        id: "12b3c1cb-8f63-42a9-bed2-ef0dbf8adcd6",
        username: "Demo-user-one",

        imgUrl:
          "https://res.cloudinary.com/dpnevk8db/image/upload/v1719231948/avatar4_wmaocu.jpg",
        isAdmin: false,
      },
    },
    {
      id: "d6a5a82f-dbe7-40ad-ae3f-196cf91aec22",
      youtubeId: "pAgnJDJN4VA",
      name: "DCBackInBlac...",
      artist: "AC",
      thumbnail: "https://i.ytimg.com/vi/pAgnJDJN4VA/mqdefault.jpg",
      genres: [EGenres.OTHER],
      duration: "04:14",
      addBy: {
        id: "12b3c1cb-8f63-42a9-bed2-ef0dbf8adcd6",
        username: "Demo-user-one",

        imgUrl:
          "https://res.cloudinary.com/dpnevk8db/image/upload/v1719231948/avatar4_wmaocu.jpg",
        isAdmin: false,
      },
    },
    {
      id: "cca9a6a9-64c4-4c27-92b9-5cab2c469f9d",
      youtubeId: "gEPmA3USJdI",
      name: "DCHighwaytoH...",
      artist: "AC",
      thumbnail: "https://i.ytimg.com/vi/gEPmA3USJdI/mqdefault.jpg",
      genres: [EGenres.OTHER],
      duration: "04:45",
      addBy: {
        id: "12b3c1cb-8f63-42a9-bed2-ef0dbf8adcd6",
        username: "Demo-user-one",

        imgUrl:
          "https://res.cloudinary.com/dpnevk8db/image/upload/v1719231948/avatar4_wmaocu.jpg",
        isAdmin: false,
      },
    },
    {
      id: "db510421-8ce5-49ae-8e11-ed352259a6f2",
      youtubeId: "l482T0yNkeo",
      name: "DCHighwaytoH...",
      artist: "AC",
      thumbnail: "https://i.ytimg.com/vi/l482T0yNkeo/mqdefault.jpg",
      genres: [EGenres.OTHER],
      duration: "03:28",
      addBy: {
        id: "12b3c1cb-8f63-42a9-bed2-ef0dbf8adcd6",
        username: "Demo-user-one",

        imgUrl:
          "https://res.cloudinary.com/dpnevk8db/image/upload/v1719231948/avatar4_wmaocu.jpg",
        isAdmin: false,
      },
    },
    {
      id: "e87bdace-0911-40b0-8870-9520b128a635",
      youtubeId: "apBWI6xrbLY",
      name: "Good Vibrations",
      artist: "TheBeachBoys",
      thumbnail: "https://i.ytimg.com/vi/apBWI6xrbLY/mqdefault.jpg",
      genres: [EGenres.OTHER],
      duration: "03:35",
      addBy: {
        id: "12b3c1cb-8f63-42a9-bed2-ef0dbf8adcd6",
        username: "Demo-user-one",

        imgUrl:
          "https://res.cloudinary.com/dpnevk8db/image/upload/v1719231948/avatar4_wmaocu.jpg",
        isAdmin: false,
      },
    },
    {
      id: "42a8651c-f0e5-4bfa-8566-32ab9830dd7e",
      youtubeId: "Ef9QnZVpVd8",
      name: "YouCantAlway...",
      artist: "TheRollingSt...",
      thumbnail: "https://i.ytimg.com/vi/Ef9QnZVpVd8/mqdefault.jpg",
      genres: [EGenres.OTHER],
      duration: "04:29",
      addBy: {
        id: "12b3c1cb-8f63-42a9-bed2-ef0dbf8adcd6",
        username: "Demo-user-one",

        imgUrl:
          "https://res.cloudinary.com/dpnevk8db/image/upload/v1719231948/avatar4_wmaocu.jpg",
        isAdmin: false,
      },
    },
    {
      id: "7981f15f-af91-4545-b10a-e03ed29f73c8",
      youtubeId: "ZHwVBirqD2s",
      name: "I39mStillSta...",
      artist: "EltonJohn",
      thumbnail: "https://i.ytimg.com/vi/ZHwVBirqD2s/mqdefault.jpg",
      genres: [EGenres.OTHER],
      duration: "03:03",
      addBy: {
        id: "12b3c1cb-8f63-42a9-bed2-ef0dbf8adcd6",
        username: "Demo-user-one",

        imgUrl:
          "https://res.cloudinary.com/dpnevk8db/image/upload/v1719231948/avatar4_wmaocu.jpg",
        isAdmin: false,
      },
    },
    {
      id: "87a6bc7f-7232-41d2-b626-cb93f8626e93",
      youtubeId: "FDMq9ie0ih0",
      name: "Genres.OTHERhipLe...",
      artist: "LedZeppelin",
      thumbnail: "https://i.ytimg.com/vi/FDMq9ie0ih0/mqdefault.jpg",
      genres: [EGenres.OTHER],
      duration: "02:15:15",
      addBy: {
        id: "12b3c1cb-8f63-42a9-bed2-ef0dbf8adcd6",
        username: "Demo-user-one",

        imgUrl:
          "https://res.cloudinary.com/dpnevk8db/image/upload/v1719231948/avatar4_wmaocu.jpg",
        isAdmin: false,
      },
    },
  ];
  const BATCH_SIZE = 5;
  const DELAY_BETWEEN_BATCHES = 10000;

  for (let i = 0; i < songs.length; i += BATCH_SIZE) {
    const batch = songs.slice(i, i + BATCH_SIZE);
    songsParserServices.processSongsInBatch(batch, DELAY_BETWEEN_BATCHES);
  }

  //   const songs = await songsServices.get({});
};

processSongsInBatch();

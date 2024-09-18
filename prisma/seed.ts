import {
  PLAYLISTS_TYPES,
  TPlaylistType,
} from "../src/api/playlists/playlist.model";
import { ISong } from "../src/api/song/song.model";
import { IItemType } from "../src/models/app.model";
import fs from "fs";

const ARTIEST_LIST = [
  "The Beatles",
  "Michael Jackson",
  "Elvis Presley",
  "Taylor Swift",
  "Beyoncé",
  "Kanye West",
  "Drake",
  "Ariana Grande",
  "The Rolling Stones",
  "Led Zeppelin",
  "Queen",
  "The Weeknd",
  "Ed Sheeran",
  "Rihanna",
  "Bruno Mars",
  "Justin Bieber",
  "Adele",
  "Eminem",
  "Madonna",
  "Pink Floyd",
  "David Bowie",
  "Prince",
  "Jay-Z",
  "Billie Eilish",
  "Lady Gaga",
  "Coldplay",
  "Kendrick Lamar",
  "Post Malone",
  "Fleetwood Mac",
  "Nirvana",
  "The Eagles",
  "Bruce Springsteen",
  "U2",
  "Bob Dylan",
  "The Who",
  "Whitney Houston",
  "The Beach Boys",
  "ABBA",
  "Frank Sinatra",
  "Metallica",
  "Maroon 5",
  "Sia",
  "Travis Scott",
  "Linkin Park",
  "Radiohead",
  "Dua Lipa",
  "Katy Perry",
  "Lil Wayne",
  "Cardi B",
  "Jimi Hendrix",
  "John Lennon",
  "Red Hot Chili Peppers",
  "The Doors",
  "Miley Cyrus",
  "Lana Del Rey",
  "Harry Styles",
  "The Police",
  "The Killers",
  "Oasis",
  "Rage Against The Machine",
  "Elton John",
  "Shawn Mendes",
  "Sam Smith",
  "Imagine Dragons",
  "Green Day",
  "Pink",
  "Doja Cat",
  "Lil Nas X",
  "Alicia Keys",
  "Tupac Shakur",
  "The Notorious B.I.G.",
  "Pearl Jam",
  "Aerosmith",
  "The Clash",
  "Guns N’ Roses",
  "Bob Marley",
  "Florence + The Machine",
  "Bon Jovi",
  "Blink-182",
  "Shakira",
  "The Black Keys",
  "The Strokes",
  "The Smashing Pumpkins",
  "Depeche Mode",
  "Foo Fighters",
  "Janet Jackson",
  "Kacey Musgraves",
  "Lil Baby",
  "J. Cole",
  "Chris Brown",
  "Usher",
  "Nicki Minaj",
  "XXXTentacion",
  "Bill Withers",
  "Tina Turner",
  "Stevie Wonder",
  "George Michael",
  "Phil Collins",
  "Simon & Garfunkel",
  "Kiss",
  "Panic! At The Disco",
  "Childish Gambino",
  "Nas",
  "2Pac",
  "Snoop Dogg",
  "Frank Ocean",
  "Megan Thee Stallion",
  "Tyler, The Creator",
  "Lil Uzi Vert",
  "Future",
  "Trippie Redd",
  "Halsey",
  "Zayn Malik",
  "Camila Cabello",
  "Demi Lovato",
  "Ellie Goulding",
  "Tove Lo",
  "Jessie J",
  "The Chainsmokers",
  "DJ Khaled",
  "Avicii",
  "Calvin Harris",
  "Tiesto",
  "Marshmello",
  "Martin Garrix",
  "Kygo",
  "Zedd",
  "Daft Punk",
  "Deadmau5",
  "David Guetta",
  "Justice",
  "The Chemical Brothers",
  "Disclosure",
  "Major Lazer",
  "Diplo",
  "Alan Walker",
  "Swedish House Mafia",
  "Steve Aoki",
  "The Prodigy",
  "Faithless",
  "Above & Beyond",
  "Paul Oakenfold",
  "Paul van Dyk",
  "Armin van Buuren",
  "Eric Prydz",
  "Fatboy Slim",
  "Moby",
  "Underworld",
  "Deftones",
  "Queens of the Stone Age",
  "Arctic Monkeys",
  "Mumford & Sons",
  "Vampire Weekend",
  "Tame Impala",
  "The White Stripes",
  "Jack White",
  "Kings of Leon",
  "The Lumineers",
  "Of Monsters and Men",
  "The 1975",
  "Bastille",
  "Twenty One Pilots",
  "The Neighbourhood",
  "Imagine Dragons",
  "Arcade Fire",
  "LCD Soundsystem",
  "Phoenix",
  "The National",
  "Beck",
  "The Flaming Lips",
  "Grimes",
  "Car Seat Headrest",
  "The War on Drugs",
  "Bon Iver",
  "Sufjan Stevens",
  "Father John Misty",
  "Mac DeMarco",
  "MGMT",
  "Foster The People",
  "Chvrches",
  "Purity Ring",
  "Crystal Castles",
  "Passion Pit",
  "Portugal. The Man",
  "The XX",
  "Lorde",
  "Vance Joy",
  "Shawn Mendes",
  "Troye Sivan",
  "Billie Joe Armstrong",
  "Stevie Nicks",
  "Diana Ross",
  "Barry White",
  "Marvin Gaye",
  "Aretha Franklin",
  "James Brown",
  "Ray Charles",
  "Smokey Robinson",
  "The Supremes",
  "Earth, Wind & Fire",
  "Al Green",
  "Curtis Mayfield",
  "Isaac Hayes",
  "Otis Redding",
  "The Temptations",
  "The Four Tops",
  "The Jackson 5",
  "The Commodores",
  "The Isley Brothers",
  "Sam Cooke",
  "Gladys Knight & The Pips",
  "The O’Jays",
  "Patti LaBelle",
];


const BASE_URL = "https://www.googleapis.com/youtube/v3";
const URL_SEARCH = `${BASE_URL}/search?key=${API_KEY_YT}&`;
const URL_VIDEOS = `${BASE_URL}/videos?`;
const MAX_RESULTS = 10;

async function seed() {
  try {
    // const data = readData();
    // console.log(data.length);
    // await getSongsToJson();
  //  const res = await processAllResults([
  //     {
  //       title: "The Beatles - Don&#39;t Let Me Down",
  //       duration: "00:00",
  //       youtubeId: "NCtzkaL2t_Y",
  //       imgUrl: "https://i.ytimg.com/vi/NCtzkaL2t_Y/mqdefault.jpg",
  //       addedBy: "artist",
  //       addedAt: "Tue Sep 17 2024 22:45:42 GMT+0300 (Israel Daylight Time)",
  //       itemType: "SONG",
  //     },
  //   ]);
    console.log("res:", API_KEY_OPEN)
  } catch (error) {
    console.error("Error during seeding:", error);
  }
}

const getSongsToJson = async () => {
  let requestCount = 0;
  const MAX_REQUESTS_BEFORE_DELAY = 10;

  const promises = ARTIEST_LIST.map(async (artist) => {
    if (requestCount >= MAX_REQUESTS_BEFORE_DELAY) {
      console.log("Delaying to avoid API rate limits...");
      await delay(60000); // Delay for 1 minute
      requestCount = 0;
    }

    await delay(1000); // Optional delay between each artist request
    requestCount += 1;

    try {
      return getSongsFromYT(artist);
    } catch (error) {
      console.error(`Error fetching songs for ${artist}:`, error);
      return [];
    }
  });

  const songs = await Promise.all(promises);
  const songsFlat = songs.flat();
  writeData(songsFlat);
};

async function processAllResults(YTSongs: ISongYT[]) {
  const finalResults: ISong[] = [];

  for (const song of YTSongs) {
    const processedData = await processYouTubeDataWithOpenAI(song);
    console.log("processedData:", processedData);

    // Delay to avoid exceeding OpenAI rate limits
    await delay(2000); // Adjust based on OpenAI rate limits
  }

  // Save the final results to a JSON file
  // saveToFile(finalResults);
}

//Process data helper functions
async function processYouTubeDataWithOpenAI(video: ISongYT) {
  const prompt = `Split the following YouTube video title into artist and song. 
  Assign genres and choose the most appropriate playlist type from this list: ${PLAYLISTS_TYPES.join(
    ", "
  )}. 
  Title: "${video.title}"`;

  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer YOUR_OPENAI_API_KEY`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 100,
    }),
  });
  const data = await response.json();
  return data.choices[0].text.trim();
}

// Get songs helper functions
const getSongsFromYT = async (search: string): Promise<ISongYT[]> => {
  try {
    const url = `${URL_SEARCH}part=snippet&q=${search}&videoCategoryId=10&type=video&maxResults=${MAX_RESULTS}`;
    const items = await fetchFromYT(url);

    const promisesSongs = items.map(
      async (ytItem: ytSongResponse): Promise<ISongYT> => {
        const duration = await getDuration(ytItem.id.videoId);
        return {
          title: ytItem.snippet.title,
          duration,
          youtubeId: ytItem.id.videoId,
          imgUrl: ytItem.snippet.thumbnails.medium.url,
          addedBy: "artist",
          addedAt: new Date().toString(),
          itemType: "SONG",
        };
      }
    );

    return await Promise.all(promisesSongs);
  } catch (error) {
    console.error(`Error fetching songs for ${search}:`, error);
    return [];
  }
};

const fetchFromYT = async (url: string) => {
  const response = await fetch(url);
  console.log("response:", response);
  const data = await response.json();
  if (!data?.items) {
    throw new Error("No items found");
  }
  return data.items;
};

const getDuration = async (videoId: string): Promise<string> => {
  const url = `${URL_VIDEOS}id=${videoId}&part=contentDetails&key=${API_KEY_YT}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const duration = data.items[0]?.contentDetails?.duration;

    if (!duration) {
      return "00:00";
    }

    return formatDuration(duration);
  } catch (err) {
    console.error("Error getting duration", err);
    return "00:00";
  }
};
const formatDuration = (duration: string): string => {
  if (duration === "P0D") return "99:99:99";

  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = duration.match(regex);

  if (!matches) return "01:00";

  const hours = matches[1] ? parseInt(matches[1], 10) : 0;
  const minutes = matches[2] ? parseInt(matches[2], 10) : 0;
  const seconds = matches[3] ? parseInt(matches[3], 10) : 0;

  const formattedHours = hours > 0 ? `${padWithZero(hours)}:` : "";
  const formattedMinutes = padWithZero(minutes);
  const formattedSeconds = padWithZero(seconds);

  return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
};

const padWithZero = (number: number): string => {
  return number.toString().padStart(2, "0");
};

// File I/O helper functions
const writeData = (data: any) => {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const dbFilePath = `db-${timestamp}.json`;

    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
    console.log("Data saved to", dbFilePath);
  } catch (error) {
    console.error("Error saving file:", error);
  }
};

const readData = () => {
  try {
    const data = fs.readFileSync("db.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading file:", error);
    return [];
  }
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Interfaces
interface ytSongResponse {
  snippet: {
    title: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
  };
  id: {
    videoId: string;
  };
}

interface ISongYT extends IItemType {
  title: string;
  duration: string;
  youtubeId: string;
  imgUrl: string;
  addedBy: string;
  addedAt: string;
}

// Seed the database
seed().then(() => {
  try {
    console.info("Seeding done");
  } catch (error) {
    console.error("Error finalizing seeding:", error);
  }
});

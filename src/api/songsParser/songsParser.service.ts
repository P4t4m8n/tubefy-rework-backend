import axios from "axios";
import { ISong } from "../songs/song.model";

export class songParserService {
  private OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  private URL = "https://api.openai.com/v1/completions";

  async processSongsInBatch(
    batch: { name: string; artist: string }[],
    delay: number
  ) {
    const results = [];
    for (const song of batch) {
      const text = `${song.name} ${song.artist}`;
      const payload = {
        model: "gpt-3.5-turbo",
        prompt: `Extract artist, song name, and genre from this text: "${text}". Format the response as "Artist: <artist>, Name: <name>, Genre: <genre>".`,
        max_tokens: 50,
        temperature: 0,
        n: 1,
        stop: ["\n"],
      };
      const headers = {
        Authorization: `Bearer ${this.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      };

      let attempt = 0;
      while (attempt < 5) {
        try {
          const response = await axios.post(this.URL, payload, { headers });
          const result = response.data.choices[0].text.trim();
          const [artist, name, genre] = result
            .split(",")
            .map((item: string) => item.split(":")[1].trim());
          results.push({ ...song, artist, genre });
          break;
        } catch (error) {
          if ((error as any).response?.status === 429) {
            console.error(`Rate limit exceeded. Retrying after ${delay}ms`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2; 
          } else {
            console.error(`Failed to process song: ${text} error: ${error}`);
            break;
          }
        }
        attempt++;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    return results;
  }
}

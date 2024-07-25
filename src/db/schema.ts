import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";

export const friendStatusEnum = pgEnum("friend_status", [
  "PENDING",
  "ACCEPTED",
  "BLOCKED",
  "REJECTED",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").notNull(),
    email: text("email").notNull(),
    password: text("password_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    avatarUrl: text("avatar_url").notNull(),
    isAdmin: boolean("is_admin").default(false).notNull(),
  },
  (users) => {
    return {
      emailIndex: uniqueIndex("email_idx").on(users.email),
      usernameIndex: uniqueIndex("username_idx").on(users.username),
    };
  }
);

export const songs = pgTable(
  "songs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    youtubeId: text("youtube_id").notNull(),
    title: text("title").notNull(),
    artist: text("artist"),
    thumbnail: text("thumbnail"),
    duration: integer("duration"),
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (songs) => {
    return {
      youtubeIdIndex: uniqueIndex("youtube_id_idx").on(songs.youtubeId),
    };
  }
);

export const playlists = pgTable("playlists", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  ownerId: uuid("owner_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  imgUrl: text("img_url").notNull(),
});

export const playlistSongs = pgTable("playlist_songs", {
  id: uuid("id").defaultRandom().primaryKey(),
  playlistId: integer("playlist_id")
    .references(() => playlists.id)
    .notNull(),
  songId: integer("song_id")
    .references(() => songs.id)
    .notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  order: integer("order").notNull(),
});

export const songLikes = pgTable("song_likes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  songId: uuid("song_id")
    .references(() => songs.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const friends = pgTable("friends", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  friendId: uuid("friend_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: friendStatusEnum("status").notNull().default("PENDING"),
});

export const playlistLikes = pgTable("playlist_likes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  playlistId: integer("playlist_id")
    .references(() => playlists.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const playlistShares = pgTable(
  "playlist_shares",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    playlistId: integer("playlist_id")
      .references(() => playlists.id)
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    sharedAt: timestamp("shared_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      uniqueShare: uniqueIndex("unique_share_idx").on(
        table.playlistId,
        table.userId
      ),
    };
  }
);

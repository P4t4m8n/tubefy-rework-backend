-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('POP', 'ROCK', 'JAZZ', 'BLUES', 'HIP_HOP', 'RAP', 'COUNTRY', 'CLASSICAL', 'FOLK', 'LATIN', 'METAL', 'REGGAE', 'SOUL', 'ELECTRONIC', 'DANCE', 'INDIE', 'ALTERNATIVE', 'PUNK', 'R_AND_B', 'FUNK', 'DISCO', 'TECHNO', 'HOUSE', 'TRANCE', 'DUBSTEP', 'DRUM_AND_BASS', 'AMBIENT', 'CHILLOUT', 'DOWNTEMPO', 'REGGAETON', 'SKA', 'GRUNGE', 'EMO', 'GOTHIC', 'HARDCORE', 'HARDSTYLE', 'INDUSTRIAL', 'NEW_WAVE', 'NOISE', 'PSYCHEDELIC', 'SYNTHPOP', 'TRAP', 'VAPORWAVE', 'WORLD', 'OTHER');

-- CreateEnum
CREATE TYPE "FriendStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PlaylistType" AS ENUM ('NEW_MUSIC', 'DAILY_MIX', 'CHILL', 'WORKOUT', 'PARTY', 'FOCUS', 'SLEEP', 'TRAVEL', 'KIDS', 'COOKING', 'WELLNESS', 'STUDY', 'CHILLOUT', 'NEW_WAVE', 'EMPTY', 'LIKED_SONGS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "imgUrl" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "added_by_user_id" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "genres" "Genre"[] DEFAULT ARRAY['OTHER']::"Genre"[],

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "owner_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'EMPTY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "imgUrl" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "genres" "Genre"[] DEFAULT ARRAY['OTHER']::"Genre"[],
    "types" "PlaylistType"[] DEFAULT ARRAY['EMPTY']::"PlaylistType"[],

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistSong" (
    "id" TEXT NOT NULL,
    "playlist_id" TEXT NOT NULL,
    "song_id" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistSong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SongLike" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "song_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SongLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistLike" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "playlist_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friend" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "FriendStatus" NOT NULL DEFAULT 'PENDING',
    "user_id" TEXT NOT NULL,
    "friend_id" TEXT NOT NULL,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistShare" (
    "id" TEXT NOT NULL,
    "playlist_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Song_youtubeId_key" ON "Song"("youtubeId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistSong_song_id_playlist_id_key" ON "PlaylistSong"("song_id", "playlist_id");

-- CreateIndex
CREATE UNIQUE INDEX "SongLike_user_id_song_id_key" ON "SongLike"("user_id", "song_id");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistLike_user_id_playlist_id_key" ON "PlaylistLike"("user_id", "playlist_id");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_user_id_friend_id_key" ON "Friend"("user_id", "friend_id");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistShare_playlist_id_user_id_key" ON "PlaylistShare"("playlist_id", "user_id");

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_added_by_user_id_fkey" FOREIGN KEY ("added_by_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistSong" ADD CONSTRAINT "PlaylistSong_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "Playlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistSong" ADD CONSTRAINT "PlaylistSong_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongLike" ADD CONSTRAINT "SongLike_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongLike" ADD CONSTRAINT "SongLike_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistLike" ADD CONSTRAINT "PlaylistLike_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistLike" ADD CONSTRAINT "PlaylistLike_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "Playlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistShare" ADD CONSTRAINT "PlaylistShare_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "Playlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistShare" ADD CONSTRAINT "PlaylistShare_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

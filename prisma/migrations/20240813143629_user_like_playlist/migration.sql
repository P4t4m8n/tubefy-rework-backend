-- CreateTable
CREATE TABLE "LikedSongsPlaylist" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL DEFAULT 'https://res.cloudinary.com/dpnevk8db/image/upload/v1705451341/playlist-like.png',

    CONSTRAINT "LikedSongsPlaylist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LikedSongsPlaylist_user_id_key" ON "LikedSongsPlaylist"("user_id");

-- AddForeignKey
ALTER TABLE "LikedSongsPlaylist" ADD CONSTRAINT "LikedSongsPlaylist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

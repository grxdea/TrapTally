-- CreateEnum
CREATE TYPE "PlaylistType" AS ENUM ('Monthly', 'Yearly', 'Artist');

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "spotifyPlaylistId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PlaylistType" NOT NULL,
    "description" TEXT,
    "coverImageUrl" TEXT NOT NULL,
    "spotifyUrl" TEXT NOT NULL,
    "associatedYear" INTEGER,
    "associatedMonth" INTEGER,
    "associatedArtistId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "spotifyArtistId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "spotifyUrl" TEXT NOT NULL,
    "monthlyFeatureCount" INTEGER NOT NULL DEFAULT 0,
    "yearlyFeatureCount" INTEGER NOT NULL DEFAULT 0,
    "bestOfPlaylistSongCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "spotifyTrackId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coverImageUrl" TEXT NOT NULL,
    "spotifyUrl" TEXT NOT NULL,
    "releaseYear" INTEGER NOT NULL,
    "releaseMonth" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistSong" (
    "playlistId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "orderInPlaylist" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaylistSong_pkey" PRIMARY KEY ("playlistId","songId")
);

-- CreateTable
CREATE TABLE "SongArtist" (
    "songId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SongArtist_pkey" PRIMARY KEY ("songId","artistId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_spotifyPlaylistId_key" ON "Playlist"("spotifyPlaylistId");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_associatedArtistId_key" ON "Playlist"("associatedArtistId");

-- CreateIndex
CREATE INDEX "Playlist_type_idx" ON "Playlist"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_spotifyArtistId_key" ON "Artist"("spotifyArtistId");

-- CreateIndex
CREATE INDEX "Artist_spotifyArtistId_idx" ON "Artist"("spotifyArtistId");

-- CreateIndex
CREATE UNIQUE INDEX "Song_spotifyTrackId_key" ON "Song"("spotifyTrackId");

-- CreateIndex
CREATE INDEX "Song_spotifyTrackId_idx" ON "Song"("spotifyTrackId");

-- CreateIndex
CREATE INDEX "PlaylistSong_songId_idx" ON "PlaylistSong"("songId");

-- CreateIndex
CREATE INDEX "SongArtist_artistId_idx" ON "SongArtist"("artistId");

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_associatedArtistId_fkey" FOREIGN KEY ("associatedArtistId") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistSong" ADD CONSTRAINT "PlaylistSong_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistSong" ADD CONSTRAINT "PlaylistSong_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongArtist" ADD CONSTRAINT "SongArtist_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SongArtist" ADD CONSTRAINT "SongArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

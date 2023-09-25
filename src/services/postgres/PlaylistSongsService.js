/* eslint-disable no-underscore-dangle */

const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { mapDBToModelPlaylist } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor(songsService) {
    this._pool = new Pool();
    this._songsService = songsService;
  }

  async addPlaylistSong(playlistId, songId) {
    const id = `playlist-song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    await this._songsService.getSongById(songId);

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, songId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Playlist song gagal ditambahkan');

    return result.rows[0].id;
  }

  async getPlaylistSongById(id) {
    const query = {
      text: `
      SELECT playlistsongs.*, songs.title, songs.performer, playlists.*, users.username
      FROM playlistsongs
      LEFT JOIN songs ON songs.id = playlistsongs.song_id
      LEFT JOIN playlists ON playlists.id = playlistsongs.playlist_id
      LEFT JOIN users on users.id = playlists.owner
      WHERE playlistsongs.playlist_id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Playlist tidak ditemukan');

    const playlist = mapDBToModelPlaylist(result.rows);

    return playlist;
  }

  async deletePlaylistSong(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) throw new InvariantError('Playlist song gagal dihapus');
  }
}

module.exports = PlaylistSongsService;

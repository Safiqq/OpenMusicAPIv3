const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapDBToModelSong, mapDBToModelActivity } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationService) {
    this.pool = new Pool();
    this.collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, owner, createdAt, updatedAt],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) throw new InvariantError('Playlist gagal ditambahkan');

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.*, users.username FROM playlists
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.owner = $1 OR collaborations.user_id = $1
      GROUP BY playlists.id, users.username`,
      values: [owner],
    };

    const result = await this.pool.query(query);
    return result.rows.map(mapDBToModelSong);
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Playlist tidak ditemukan');

    const playlist = result.rows[0];

    if (playlist.owner !== owner) throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      try {
        await this.collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addPlaylistSongActivity(playlistId, songId, userId, action) {
    const id = `playlist-song-activity-${nanoid(16)}`;
    const time = new Date().toISOString();
    const createdAt = time;
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [id, playlistId, songId, userId, action, time, createdAt, updatedAt],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) throw new InvariantError('Song Activity gagal ditambahkan');

    return result.rows[0].id;
  }

  async getPlaylistSongActivities(id) {
    const query = {
      text: `SELECT playlist_song_activities.*, playlists.id, users.username, songs.title
      FROM playlist_song_activities
      LEFT JOIN playlists ON playlists.id = playlist_song_activities.playlist_id
      LEFT JOIN users on users.id = playlist_song_activities.user_id
      LEFT JOIN songs ON songs.id = playlist_song_activities.song_id
      WHERE playlist_song_activities.playlist_id = $1
      ORDER BY time asc`,
      values: [id],
    };
    const result = await this.pool.query(query);
    const activity = mapDBToModelActivity(result.rows);
    return activity;
  }
}

module.exports = PlaylistsService;

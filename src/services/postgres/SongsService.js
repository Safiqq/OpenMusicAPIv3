const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const {
  mapDBToModelSong,
  filterTitleByParam,
  filterPerformerByParam,
} = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this.pool = new Pool();
  }

  async addSong({
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) {
    const id = `song-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId, createdAt, updatedAt],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) throw new InvariantError('Lagu gagal ditambahkan');

    return result.rows[0].id;
  }

  async getSongs(song) {
    const query = {
      text: 'SELECT id, title, performer FROM songs',
    };

    const result = await this.pool.query(query);

    const songs = result.rows;
    let filteredSong = songs;
    if ('title' in song) filteredSong = filteredSong.filter((s) => filterTitleByParam(s, song.title));
    if ('performer' in song) filteredSong = filteredSong.filter((s) => filterPerformerByParam(s, song.performer));

    return filteredSong;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Lagu tidak ditemukan');

    return result.rows.map(mapDBToModelSong)[0];
  }

  async getSongsByAlbumId(albumId) {
    const query = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs WHERE album_id = $1',
      values: [albumId],
    };

    const result = await this.pool.query(query);

    return result.rows;
  }

  async editSongById(id, {
    title,
    year,
    performer,
    genre,
    duration,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, updatedAt, id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
  }
}

module.exports = SongsService;

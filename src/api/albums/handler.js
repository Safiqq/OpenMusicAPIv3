class AlbumsHandler {
  constructor(service, songsService, validator) {
    this.service = service;
    this.songsService = songsService;
    this.validator = validator;
  }

  async postAlbumHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);

    const albumId = await this.service.addAlbum(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;

    const album = await this.service.getAlbumById(id);
    let songs = await this.songsService.getSongsByAlbumId(id);

    songs = songs.map((song) => ({
      id: song.id,
      title: song.title,
      performer: song.performer,
    }));
    album.songs = songs;

    album.coverUrl = album.cover;
    delete album.cover;

    const response = h.response({
      status: 'success',
      data: {
        album,
      },
    });
    response.code(200);
    return response;
  }

  async putAlbumByIdHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this.service.editAlbumById(id, request.payload);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;

    await this.service.deleteAlbumById(id);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil dihapus',
    });
    response.code(200);
    return response;
  }
}

module.exports = AlbumsHandler;

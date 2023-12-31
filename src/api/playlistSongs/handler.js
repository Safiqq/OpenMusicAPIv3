class PlaylistSongsHandler {
  constructor(playlistSongsService, playlistsService, validator) {
    this.playlistSongsService = playlistSongsService;
    this.playlistsService = playlistsService;
    this.validator = validator;
  }

  async postPlaylistSongHandler(request, h) {
    this.validator.validatePlaylistSongPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;
    const { id: playlistId } = request.params;

    await this.playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const playlistSongId = await this.playlistSongsService.addPlaylistSong(playlistId, songId);
    await this.playlistsService.addPlaylistSongActivity(
      playlistId,
      songId,
      credentialId,
      'add',
    );

    const response = h.response({
      status: 'success',
      message: 'Playlist song berhasil ditambahkan',
      data: {
        playlistSongId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this.playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this.playlistSongsService.getPlaylistSongById(playlistId);

    const response = h.response({
      status: 'success',
      data: {
        playlist,
      },
    });
    response.code(200);
    return response;
  }

  async deletePlaylistSongHandler(request, h) {
    this.validator.validatePlaylistSongPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;
    const { id: playlistId } = request.params;

    await this.playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this.playlistSongsService.deletePlaylistSong(playlistId, songId);
    await this.playlistsService.addPlaylistSongActivity(
      playlistId,
      songId,
      credentialId,
      'delete',
    );

    const response = h.response({
      status: 'success',
      message: 'Playlist Song berhasil dihapus',
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistSongsHandler;

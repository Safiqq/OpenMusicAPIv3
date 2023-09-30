class PlaylistsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this.validator.validatePlaylistPayload(request.payload);
    const { name = 'unnamed' } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this.service.addPlaylist({
      name, owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this.service.getPlaylists(credentialId);

    const playlistsProps = playlists.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
    }));

    const response = h.response({
      status: 'success',
      data: {
        playlists: playlistsProps,
      },
    });
    response.code(200);
    return response;
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyPlaylistOwner(id, credentialId);
    await this.service.deletePlaylistById(id);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  async getPlaylistSongActivitiesHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this.service.verifyPlaylistAccess(playlistId, credentialId);
    const playlistSongActivities = await this.service.getPlaylistSongActivities(playlistId);

    const response = h.response({
      status: 'success',
      data: playlistSongActivities,
    });
    response.code(200);
    return response;
  }
}

module.exports = PlaylistsHandler;

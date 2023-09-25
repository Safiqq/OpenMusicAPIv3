const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: (req, h) => handler.postPlaylistSongHandler(req, h),
    options: {
      auth: 'openmusicapiv2_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: (req, h) => handler.getPlaylistSongByIdHandler(req, h),
    options: {
      auth: 'openmusicapiv2_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: (req, h) => handler.deletePlaylistSongHandler(req, h),
    options: {
      auth: 'openmusicapiv2_jwt',
    },
  },
];

module.exports = routes;

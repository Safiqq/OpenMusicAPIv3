const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: (req, h) => handler.postPlaylistHandler(req, h),
    options: {
      auth: 'openmusicapiv2_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: (req, h) => handler.getPlaylistsHandler(req, h),
    options: {
      auth: 'openmusicapiv2_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: (req, h) => handler.deletePlaylistByIdHandler(req, h),
    options: {
      auth: 'openmusicapiv2_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: (req, h) => handler.getPlaylistSongActivitiesHandler(req, h),
    options: {
      auth: 'openmusicapiv2_jwt',
    },
  },
];

module.exports = routes;

const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: (req, h) => handler.postLikeHandler(req, h),
    options: {
      auth: 'openmusicapiv3_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: (req, h) => handler.deleteLikeHandler(req, h),
    options: {
      auth: 'openmusicapiv3_jwt',
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: (req, h) => handler.getLikeHandler(req, h),
  },
];

module.exports = routes;

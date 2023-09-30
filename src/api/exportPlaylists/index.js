const routes = require('./routes');
const ExportsPlaylistsHandler = require('./handler');

module.exports = {
  name: 'exportPlaylists',
  version: '1.0.0',
  register: async (server, { producerService, playlistsService, validator }) => {
    const exportsPlaylistsHandler = new ExportsPlaylistsHandler(
      producerService,
      playlistsService,
      validator,
    );
    server.route(routes(exportsPlaylistsHandler));
  },
};

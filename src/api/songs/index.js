const SongsHandler = require('./handler');
const routes = require('./routes');

// This plugin is responsible for any request to /songs url
module.exports = {
  name: 'songs',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const songsHandler = new SongsHandler(service, validator);
    server.route(routes(songsHandler));
  },
};

const Hapi = require('@hapi/hapi');
const songs = require('./api/songs');
const SongsService = require('./services/inMemory/SongsService');

const init = async () => {
  const songsService = new SongsService();

  const server = Hapi.server({
    port: 5000,
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: songs,
    options: {
      service: songsService,
    },
  });

  await server.start();
  console.log(`server is running on ${server.info.uri}`);
};

init();

/* eslint-disable indent */
/* eslint-disable object-curly-spacing */
const { nanoid } = require('nanoid');
const songs = require('./songs');

const addSongHandler = (request, h) => {
  const { title, year, performer, genre, duration } = request.payload;

  const prefix = 'song-';
  const id = prefix + nanoid(16);

  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newSong = {
    id, title, year, performer, genre, duration, insertedAt, updatedAt,
  };

  songs.push(newSong);

  const isSuccess = songs.filter((song) => song.id == id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: { songId: id },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Fail to add song',
  });
  response.code(500);
  return response;
};

const getAllSongsHandler = () => {
  const songData = [];
  songs.forEach((song) => {
    songData.push({
      'id': song.id,
      'title': song.title,
      'performer': song.performer});
  });

  return ({
    status: 'success',
    data: {
      songs: songData,
  },
});
};

const getSongByIdHandler = (request, h) => {
  const { id } = request.params;

  const song = songs.filter((s) => s.id == id)[0];

  if (song !== undefined) {
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Song not found',
  });
  response.code(404);
  return response;
};

const editSongByIdHandler = (request, h) => {
  const { id } = request.params;

  const { title, year, performer, genre, duration } = request.payload;
  const updatedAt = new Date().toISOString();

  const index = songs.findIndex((song) => song.id === id);

  if (index !== -1) {
    songs[index] = {
      ...songs[index],
      title,
      year,
      performer,
      genre,
      duration,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'lagu berhasil diperbarui',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Song not found',
  });
  response.code(404);
  return response;
};

const deleteSongByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = songs.findIndex((song) => song.id === id);

  if (index !== undefined) {
    songs.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'lagu berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Song not found',
  });
  response.code(404);
  return response;
};

module.exports = {
  addSongHandler,
  getAllSongsHandler,
  getSongByIdHandler,
  editSongByIdHandler,
  deleteSongByIdHandler,
};

const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

// This service is responsible to manage resources (CRUD) in memory (array)
class SongsService {
  constructor() {
    this._songs = [];
  }

  addSong({ title, year, performer, genre, duration }) {
    const id = 'song-' + nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const numDuration = Number(duration);
    const numYear = Number(year);

    const newSong = {
      // eslint-disable-next-line max-len
      id, title, year: numYear, performer, genre, duration: numDuration, insertedAt, updatedAt,
    };

    this._songs.push(newSong);

    const isSuccess = this._songs.filter((song) => song.id === id).length > 0;

    if (!isSuccess) {
      throw new InvariantError('Failed to add song');
    }

    return id;
  }

  getSongs() {
    const songData = [];
    this._songs.forEach((song) => {
      songData.push({
        'id': song.id,
        'title': song.title,
        'performer': song.performer,
      });
    });
    return songData;
  }

  getSongById(id) {
    const song = this._songs.filter((s) => s.id === id)[0];

    if (!song) {
      throw new NotFoundError('Song not found');
    }

    return song;
  }

  editSongById(id, { title, year, performer, genre, duration } ) {
    const index = this._songs.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new NotFoundError('Song not found');
    }

    const updatedAt = new Date().toISOString();
    const numYear = Number(year);
    const numDuration = Number(duration);

    this._songs[index] = {
      ...this._songs[index],
      title,
      year: numYear,
      performer,
      genre,
      duration: numDuration,
      updatedAt,
    };
  }

  deleteSongById(id) {
    const index = this._songs.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new NotFoundError('Song not found');
    }

    this._songs.splice(index, 1);
  }
}

module.exports = SongsService;

const { nanoid } = require('nanoid');

// This service is responsible to manage resources (CRUD) in memory (array)
class SongsService {
  constructor() {
    this._songs = [];
  }

  addSong({ title, year, performer, genre, duration }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const newSong = {
      id, title, year, performer, genre, duration, createdAt, updatedAt,
    };

    this._songs.push(newSong);

    const isSuccess = this._songs.filter((song) => song.id === id).length > 0;

    if (!isSuccess) {
      throw new Error('Failed to add song');
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
      throw new Error('Song not found');
    }

    return song;
  }

  editSongById(id, { title, year, performer, genre, duration } ) {
    const index = this._songs.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error('Song not found');
    }

    const updatedAt = new Date().toISOString();

    this._songs[index] = {
      ...this._songs[index],
      title,
      year,
      performer,
      genre,
      duration,
      updatedAt,
    };
  }

  deleteSongById(id) {
    const index = this._songs.findIndex((song) => song.id === id);

    if (index === -1) {
      throw new Error('Song not found');
    }

    this._songs.splice(index, 1);
  }
}

module.exports = SongsService;

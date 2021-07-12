/* eslint-disable max-len */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = 'playlist-' + nanoid(16);

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Fail to add playlist');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text:
      `SELECT pl.id, pl.name, users.username 
      FROM playlists as pl 
      INNER JOIN 
      users ON pl.owner = users.id
      LEFT JOIN collaborations on pl.id = collaborations.playlist_id
      WHERE pl.owner = $1 OR collaborations.user_id = $1`,
      values: [owner],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Cannot find playlist by that id');
    };
  };

  async addSongToPlaylist(playlistId, songId) {
    const id = 'playlistsong-' + nanoid(16);

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Fail to add playlist');
    }

    return result.rows[0].id;
  }

  async getSongsFromPlaylistByPlaylistId(playlistId) {
    const query = {
      text:
      `SELECT songs.id, songs.title, songs.performer 
      FROM playlistsongs as pl
      INNER JOIN songs
      ON pl.song_id = songs.id
      WHERE pl.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Cannot find playlist by that id');
    }

    return result.rows;
  }

  async deleteSongFromPlaylistBySongId(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE song_id = $1 AND playlist_id = $2 RETURNING song_id',
      values: [songId, playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Cannot find song by that id');
    };
  };
  // only accept owner id
  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist not found');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('You are not authorized to access this resource');
    }
  }

  // can be owner or collaborator id
  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;

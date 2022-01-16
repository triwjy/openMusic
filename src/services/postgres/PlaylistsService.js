/* eslint-disable max-len */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor(collaborationService, cacheService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
    this._cacheService = cacheService;
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

    // playlists owned by owner is updated, thus the cache becomes obsolete
    await this._cacheService.delete(`playlists:${owner}`);
    console.log(`deleted: playlists:${owner}`);
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    try {
      // try to find playlists owned by owner in cache
      const result = await this._cacheService.get(`playlists:${owner}`);
      return JSON.parse(result);
    } catch (error) {
      // not found, fetch from db
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

      // update cache w/ data from db
      await this._cacheService.set(`playlists:${owner}`, JSON.stringify(result.rows));
      console.log(`added playlists:${owner}`);
      return result.rows;
    }
  }

  async deletePlaylistById(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id, owner',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Cannot find playlist by that id');
    };

    // playlist no longer exist, delete playlists owned by owner from cache
    const owner = result.rows[0].owner;
    await this._cacheService.delete(`playlists:${owner}`);
    console.log(`deleted: playlists:${owner}`);

    // playlist no longer exist, songs shouldn't be accessible if someone is trying to fetch it by playlistId
    await this._cacheService.delete(`songs:${playlistId}`);
    console.log(`deleted songs:${playlistId} `);
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

    // songs inside playlist changed, delete songs cache
    await this._cacheService.delete(`songs:${playlistId}`);
    console.log(`deleted songs:${playlistId}`);
    return result.rows[0].id;
  }

  async getSongsFromPlaylistByPlaylistId(playlistId) {
    // try to get songs from playlist in cache
    try {
      const result = await this._cacheService.get(`songs:${playlistId}`);
      return JSON.parse(result);

    // cannot get from cache, try from db
    } catch (error) {
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

      // save to cache
      this._cacheService.set(`songs:${playlistId}`, JSON.stringify(result.rows));
      console.log(`added songs:${playlistId}`);

      return result.rows;
    }
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

    // songs inside playlist changed, delete songs cache
    await this._cacheService.delete(`songs:${playlistId}`);
    console.log(`deleted songs:${playlistId}`);
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

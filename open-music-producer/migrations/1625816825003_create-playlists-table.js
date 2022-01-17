/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'TEXT',
      notNull: true,
      references: 'users(id)',
      onDelete: 'cascade',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('playlists');
};

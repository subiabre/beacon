const { DataTypes } = require('sequelize');
const database = require('../sqlite');

const Song = database.define('Song', {
  file: {
      type: DataTypes.STRING,
      allowNull: false
  },
  meta: {
    type: DataTypes.JSON,
    allowNull: true
  }
});

Song.sync();

module.exports = Song;

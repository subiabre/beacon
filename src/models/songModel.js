const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite:memory', {logging: false});

const Song = sequelize.define('Song', {
  file: {
      type: DataTypes.STRING,
      allowNull: false
  },
  meta: {
    type: DataTypes.JSON,
    allowNull: true
  }
});

Song.sync({ force: true });

module.exports = Song;

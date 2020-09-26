const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:', {logging: false});

const Socket = sequelize.define('Socket', {
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true
  },
  userAgent: {
      type: DataTypes.JSON,
      allowNull: true
  },
  userAgentOriginal: {
    type: DataTypes.STRING,
    allowNull: false
  },
  connectedAt: {
      type: DataTypes.TIME,
      allowNull: false
  }
});

Socket.sync({ force: true });

module.exports = Socket;

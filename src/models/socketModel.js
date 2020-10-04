const { DataTypes } = require('sequelize');
const database = require('../sqlite');

const Socket = database.define('Socket', {
  id: {
    type: DataTypes.STRING,
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
  online: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  connectedAt: {
      type: DataTypes.TIME,
      allowNull: false,
      defaultValue: new Date()
  }
});

Socket.sync();

module.exports = Socket;

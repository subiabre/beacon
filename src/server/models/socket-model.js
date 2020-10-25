const { DataTypes } = require('sequelize');
const database = require('../service/database');

const Socket = database.define('socket', {
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true
  },
  userAgent: {
      type: DataTypes.JSON,
      allowNull: true
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  isAvailable: {
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

Socket.hasOne(Socket, {
  as: 'target',
  allowNull: true
});

Socket.hasOne(Socket, {
  as: 'origin',
  allowNull: true
});

Socket.sync({
  force: true
});

module.exports = Socket;

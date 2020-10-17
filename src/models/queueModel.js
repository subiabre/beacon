const { DataTypes } = require('sequelize');
const database = require('../sqlite');
const Socket = require('./socketModel');

const Queue = database.define('Queue', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  items: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
  }
});

Queue.belongsTo(Socket, {
    as: 'socket'
});

Queue.sync({
  force: true
});

module.exports = Queue;

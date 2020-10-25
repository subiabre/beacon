const { DataTypes } = require('sequelize');
const database = require('../service/database');
const Socket = require('./socket-model');

const Queue = database.define('queue', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  list: {
      type: DataTypes.JSON,
      allowNull: true,
  }
});

Queue.belongsTo(Socket, {
    as: 'socket'
});

Queue.sync({
  force: true
});

module.exports = Queue;

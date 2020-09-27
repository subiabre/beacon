const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:', {logging: false});

const Socket = sequelize.define('Socket', {
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

Socket.sync({ force: true });

module.exports = Socket;

"use strict";

const { Sequelize } = require('sequelize');

/**
 * Default Sequelize + SQLite db
 */
const database = new Sequelize('sqlite:memory', {logging: false});

module.exports = database;

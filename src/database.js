const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('users-db', 'user', 'pass', {
    dialect: 'sqlite',
    host: './users.sqlite'
});

module.exports = sequelize;
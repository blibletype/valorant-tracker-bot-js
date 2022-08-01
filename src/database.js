const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('users-db', 'user', 'pass', {
    dialect: 'sqlite',
    host: './users.sqlite',
    // logging: false
});

module.exports = sequelize;
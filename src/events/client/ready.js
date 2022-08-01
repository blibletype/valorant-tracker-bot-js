const sequelize = require('../../database');
const User = require('../../models/User')

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`${client.user.tag} is logged in and online now!!!`);
        sequelize.sync().then(() => {
            console.log('db ready')
        });
    }
}
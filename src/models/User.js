const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../src/database');

class User extends Model {}

User.init({
    discord_id: {
        type: DataTypes.BIGINT,
        unique: true
    },
    valorant_name: {
        type: DataTypes.STRING
    },
    valorant_tag: {
        type: DataTypes.STRING
    },
    puuid: {
        type: DataTypes.STRING,
        unique: true
    },
    region: {
        type: DataTypes.STRING
    },
    account_level: {
        type: DataTypes.SMALLINT
    },
    small_card_url: {
        type: DataTypes.STRING
    },
    large_card_url: {
        type: DataTypes.STRING
    },
    wide_card_url: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    modelName: 'user',
    timestamps: false
});

module.exports = User;

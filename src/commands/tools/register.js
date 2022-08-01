const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reg')
        .setDescription('Прив\'язка аккаунту Discord до аккаунту Valorant')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Нік Valorant')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tag')
                .setDescription('Тег Valorant')
                .setRequired(true)),

    async execute(interaction, client) {
        const message = await interaction.deferReply({
            fetchReply: true,
            ephemeral: true
        });

        const name = interaction.options.getString('name');
        const tag = interaction.options.getString('tag');
        
        try {
            const res = await axios.get(`https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`, {
                headers: {
                    'Authorization': `${process.env.api_key}`
                }
            });
            console.log(res.data)


            
        } catch (error) {
            const err = error.response.data.status;
            let title, description;
            switch (err) {
                case 404:
                    title = 'Невірно вказано нік або тег 🧬';
                    description = 'Перевір будь ласка чи правильно вказані дані, знаку \'#\' **НЕ** потрібно';
                    break;
                case 400:
                    title = 'Невірно вказано нік або тег 🧬';
                    description = 'Перевір будь ласка чи правильно вказані дані, знаку \'#\' **НЕ** потрібно\n';
                    break;
                case 500:
                    title = 'Ой, а схоже що серверу зараз погано 🥲';
                    description = 'Тут ми безсилі, чекаємо fix';
                    break;
                case 429:
                    title = 'Ліміт запитів перевищено 😥';
                    description = 'Спробуй будь ласка ще раз через хвилину';
                    break;
                default:
                    title = 'Упссс, я поламався 🤨';
                    description = 'Зв\'яжись з адміном, нехай гляне що там сталось';                
            };
            embed = new EmbedBuilder()
                        .setTitle(`${title}`)
                        .setDescription(`${description}`)
                        .setColor('#f80c0c')
                        .setTimestamp(Date.now());

                        await interaction.editReply({
                            embeds: [embed],
            });
            
        }          
    }
};
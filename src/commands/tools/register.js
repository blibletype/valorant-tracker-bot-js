const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const User = require('../../models/User');
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
        const discord_id = interaction.user.id;

        const user = await User.findOne({ where: { discord_id: discord_id } });
            
        if (!(user === null)) {
            embed = new EmbedBuilder()
                .setTitle(`Ви уже зареєстровані 🚫`)
                .setDescription(`Якщо це не так зв'яжіться з адміністрацією`)
                .setColor('#f80c0c')
                .setThumbnail(client.user.displayAvatarURL())
                .setTimestamp(Date.now());

            await interaction.editReply({
                embeds: [embed],
            });
            return;
        }      
        
        try {
            const res = await axios.get(`https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`, {
                headers: {
                    'Authorization': `${process.env.api_key}`
                }
            });
            
            const account_level = res.data.data.account_level;
            const puuid = res.data.data.puuid;
            const region = res.data.data.region;
            const small_card_url = res.data.data.card.small;
            const large_card_url = res.data.data.card.large;
            const wide_card_url = res.data.data.card.wide;
   
            try {
                const res = await axios.get(`https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr/${region}/${puuid}`, {
                headers: {
                    'Authorization': `${process.env.api_key}`
                }
            });

            const elo = res.data.data.elo;
            const current_tier_patched = res.data.data.currenttierpatched;

            await User.create({
                discord_id: discord_id,
                valorant_name: name,
                valorant_tag: tag,
                puuid: puuid,
                elo: elo,
                current_tier_patched: current_tier_patched,
                region: region,
                account_level: account_level,
                small_card_url: small_card_url,
                large_card_url: large_card_url,
                wide_card_url: wide_card_url
            });

            embed = new EmbedBuilder()
                .setTitle(`Прив'язка пройшла успішно ✅`)
                .setDescription(`Тепер ви можете користуватись командою /stats`)
                .setColor('#2d912c')
                .setThumbnail(client.user.displayAvatarURL())
                .setTimestamp(Date.now());

            await interaction.editReply({
                embeds: [embed],
            });

            } catch (error) {
                console.error(error);
                embed = new EmbedBuilder()
                    .setTitle(`Упссс, я поламався 😭`)
                    .setDescription(`Зв\'яжись з адміном, нехай гляне що там сталось`)
                    .setColor('#f80c0c')
                    .setThumbnail(client.user.displayAvatarURL())
                    .setTimestamp(Date.now());

                await interaction.editReply({
                    embeds: [embed],
                });
            }
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
                    title = 'Упссс, я поламався 😭';
                    description = 'Зв\'яжись з адміном, нехай гляне що там сталось';                
            };
            embed = new EmbedBuilder()
                .setTitle(`${title}`)
                .setDescription(`${description}`)
                .setColor('#f80c0c')
                .setThumbnail(client.user.displayAvatarURL())
                .setTimestamp(Date.now());

            await interaction.editReply({
                embeds: [embed],
            });
            
        }          
    }
};
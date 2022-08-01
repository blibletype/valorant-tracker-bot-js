const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const axios = require('axios');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Відображає статистику користувача'),
        async execute(interaction, client) {
            const message = await interaction.deferReply({
                fetchReply: true,
                ephemeral: true
            });

            if (interaction.channel.id != process.env.stats_channel_id) {
                embed = new EmbedBuilder()
                .setTitle(`Ви не можете використовувати цю команду тут ⛔`)
                .setDescription(`Спробуйте написати її тут <#${process.env.stats_channel_id}>`)
                .setColor('#f80c0c')
                .setThumbnail(client.user.displayAvatarURL())
                .setTimestamp(Date.now());

                await interaction.editReply({
                    embeds: [embed],
                });
                return;
            };

            const user = await User.findOne({ where : {discord_id: interaction.user.id} });
            if (user === null) {
                embed = new EmbedBuilder()
                    .setTitle(`Схоже що ви не прив'язали аккаунт 🤖`)
                    .setDescription(`Спробуйте прив'язати його тут -> <#${process.env.register_channel_id}>, написавши /reg`)
                    .setColor('#f80c0c')
                    .setThumbnail(client.user.displayAvatarURL())
                    .setTimestamp(Date.now());

                await interaction.editReply({
                    embeds: [embed],
                });
                return;
            };

            try {
                const res1 = await axios.get(`https://api.henrikdev.xyz/valorant/v1/by-puuid/mmr/${user.region}/${user.puuid}`, {
                    headers: {
                        'Authorization': `${process.env.api_key}`
                    }
                });
                const res2 = await axios.get(`https://api.henrikdev.xyz/valorant/v1/account/${res1.data.data.name}/${res1.data.data.tag}`, {
                    headers: {
                        'Authorization': `${process.env.api_key}`
                    }
                });

                const discord_name = interaction.user.username;
                const valorant_name = res2.data.data.name;
                const valorant_tag = res2.data.data.tag;
                const region = user.region;
                const elo = res1.data.data.elo;
                const current_tier_patched = res1.data.data.currenttierpatched;
                const account_level = res2.data.data.account_level;
                const small_card_url = res2.data.data.card.small;
                const large_card_url = res2.data.data.card.large;
                const wide_card_url = res2.data.data.card.wide;
                
                await User.update({
                    valorant_name: valorant_name,
                    valorant_tag: valorant_tag,
                    elo: elo,
                    current_tier_patched: current_tier_patched,
                    account_level: account_level,
                    small_card_url: small_card_url,
                    large_card_url: large_card_url,
                    wide_card_url: wide_card_url
                }, { where: { discord_id: interaction.user.id} });



            } catch (error) {
                console.log(error);
            }

        }
}
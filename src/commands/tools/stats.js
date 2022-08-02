const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const User = require('../../models/User');
const axios = require('axios');

const { createCanvas, GlobalFonts, loadImage } = require('@napi-rs/canvas')
const canvas = createCanvas(536, 640);
const ctx = canvas.getContext('2d');

require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Відображає статистику користувача')
        .addStringOption(option =>
            option.setName('anonymously')
                .setDescription('Надіслати статистику приватно чи публічно')
                .setRequired(true)
                .addChoices(
                    { name: 'Приватно', value: 'true' },
                    { name: 'Публічно', value: 'false' },
                )),
        async execute(interaction, client) {
            roles_list = [
                'Ascendant 1', 'Ascendant 2', 'Ascendant 3',
                'Bronze 1','Bronze 2', 'Bronze 3',
                'Diamond 1', 'Diamond 2', 'Diamond 3',
                'Gold 1', 'Gold 2', 'Gold 3',
                'Immortal 1', 'Immortal 2', 'Immortal 3',
                'Iron 1', 'Iron 2', 'Iron 3',
                'Platinum 1', 'Platinum 2', 'Platinum 3',
                'Radiant',
                'Silver 1', 'Silver 2', 'Silver 3',
                'Unranked'];
            const option = interaction.options.getString('anonymously');
            anon = false;
            if (option === 'true') {
                anon = true;
            } else {
                anon = false;
            }
            const message = await interaction.deferReply({
                fetchReply: true,
                ephemeral: anon
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
                let elo = res1.data.data.elo;
                let name, tag;
                if (elo === null) {
                    name = user.valorant_name;
                    tag = user.valorant_tag;
                } else {
                    name = res1.data.data.name;
                    tag = res1.data.data.tag;
                }
                const res2 = await axios.get(`https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`, {
                    headers: {
                        'Authorization': `${process.env.api_key}`
                    }
                });
                console.log(`https://api.henrikdev.xyz/valorant/v1/account/${name}/${tag}`);
                let valorant_name = res2.data.data.name;
                let valorant_tag = res2.data.data.tag;
                let current_tier_patched = res1.data.data.currenttierpatched;

                if (elo === null) {
                    elo = 0;
                    valorant_name = user.valorant_name;
                    valorant_tag = user.valorant_tag;
                    current_tier_patched = 'Unranked';
                } 
                const discord_name = interaction.user.username;
                const region = user.region;
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


                const background = await loadImage('src/static/img/playercardempty.png');
                const banner = await loadImage(large_card_url);
                const rank = await loadImage(`src/static/img/ranks/${current_tier_patched}.png`);
                
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                ctx.drawImage(banner, 268, 0, 268, 640);
                ctx.drawImage(rank, 103, 156);

                GlobalFonts.registerFromPath('src/static/fonts/EternalUiRegular.ttf', 'EternalUI');

                ctx.font = '22px EternalUI';
                ctx.fillStyle ='#ffffff';
                ctx.fillText(`${valorant_name}#${valorant_tag}`, 45, 304);
                ctx.fillText(`${elo}`, 45, 404);
                ctx.fillText(`${account_level}`, 45, 504);
                ctx.fillText(region, 234, 626);
                ctx.fillText(discord_name, 8, 626);
                x = (268 - ctx.measureText(current_tier_patched).width)/2;
                ctx.fillText(current_tier_patched, x, 114);

                
                list = interaction.member.roles.cache.entries();
                for (role of list) {
                    for (rank_role of roles_list) {
                        if(role[1].name === rank_role) {
                            let del_role = interaction.guild.roles.cache.find((r) => r.name == rank_role);
                            await interaction.member.roles.remove(del_role);
                        }
                    }
                };

                try {
                    let add_role = interaction.guild.roles.cache.find((r) => r.name == current_tier_patched);
                    await interaction.member.roles.add(add_role);
                } catch (error) {
                    console.error(error);
                }
                
                const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'user-card.png' });
                embed = new EmbedBuilder()
                    .setColor('#0066c0')
                    .setImage('attachment://user-card.png')
                    .setDescription(`${interaction.member}`)
                    .setTimestamp(Date.now());
                await interaction.editReply({
                    embeds: [embed],
                    files: [attachment],
                });

            } catch (error) {
                console.log(error);
            }

        }
}
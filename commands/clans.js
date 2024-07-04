const { SlashCommandBuilder } = require('@discordjs/builders');
const { CLAN_STATS, getClans, buildClanListEmbed, EMBED_CLAN_LIMIT } = require('../utils/clans');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    register_command: new SlashCommandBuilder()
        .setName('clans')
        .setDescription('Lists all of the osu! clans')
        .addStringOption(option =>
            option.setName('sort')
                .setDescription('Sort the clans by a specific stat')
                .setRequired(false)
                .addChoices(
                    [
                        ...CLAN_STATS.map(stat => {
                            return {
                                name: stat.name,
                                value: stat.value
                            }
                        })
                    ]
                )
        )
        .addIntegerOption(option =>
            option.setName('page')
                .setDescription('The page of the clans')
                .setRequired(false)
        ),
    async execute(client, interaction) {
        try {
            const sort = interaction.options.getString('sort') || 'average_pp';
            let page = interaction.options.getInteger('page') || 1;

            const clans = await getClans(page, sort);

            if (clans.length == 0) return interaction.reply({ content: 'No clans found! The API may be down.', ephemeral: true });

            //calc it from clans.total_clans and max per page
            const total_pages = Math.ceil(clans.total_clans / EMBED_CLAN_LIMIT);
            const embed = buildClanListEmbed({
                clans: clans.clans,
                page: page,
                total_pages: total_pages,
                sort: sort
            });

            const prevBatchButton = new ButtonBuilder()
                .setCustomId('clans_prev_batch')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page == 1)
                .setEmoji('⏮');

            const prevButton = new ButtonBuilder()
                .setCustomId('clans_prev')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page == 1)
                .setEmoji('◀');

            const nextButton = new ButtonBuilder()
                .setCustomId('clans_next')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page == total_pages)
                .setEmoji('▶');

            const nextBatchButton = new ButtonBuilder()
                .setCustomId('clans_next_batch')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page == total_pages)
                .setEmoji('⏭');

            let row = new ActionRowBuilder()
                .addComponents(prevBatchButton, prevButton, nextButton, nextBatchButton);

            const res = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

            const collector = res.createMessageComponentCollector({ time: 60_000 });

            collector.on('collect', async i => {
                if (i.customId === 'clans_prev_batch') {
                    page = 1;
                } else if (i.customId === 'clans_prev') {
                    page -= 1;
                } else if (i.customId === 'clans_next') {
                    page += 1;
                } else if (i.customId === 'clans_next_batch') {
                    page = total_pages;
                }

                page = Math.max(1, Math.min(page, total_pages));

                const newPrevBatchButton = ButtonBuilder.from(prevBatchButton).setDisabled(page == 1);
                const newPrevButton = ButtonBuilder.from(prevButton).setDisabled(page == 1);
                const newNextButton = ButtonBuilder.from(nextButton).setDisabled(page == total_pages);
                const newNextBatchButton = ButtonBuilder.from(nextBatchButton).setDisabled(page == total_pages);

                row = new ActionRowBuilder()
                    .addComponents(newPrevBatchButton, newPrevButton, newNextButton, newNextBatchButton);

                const newClans = await getClans(page, sort);

                if (newClans.length == 0) return interaction.editReply({ content: 'No clans found! The API may be down.', ephemeral: true });

                const newEmbed = buildClanListEmbed({
                    clans: newClans.clans,
                    page: page,
                    total_pages: total_pages,
                    sort: sort
                });

                await i.update({ embeds: [newEmbed], components: [row] });
            });

            //remove buttons when collector ends
            collector.on('end', () => {
                res.edit({ components: [] });
            });
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: 'An error occured while fetching the clans!', ephemeral: true });
        }
    }
}
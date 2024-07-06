const { SlashCommandBuilder } = require('@discordjs/builders');
const { CLAN_STATS, getClans, buildClanListEmbed, EMBED_CLAN_LIMIT, getClan, buildClanEmbed } = require('../utils/clans');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    register_command: new SlashCommandBuilder()
        .setName('clan')
        .setDescription('Show clan information')
        //either id or clan tag
        .addSubcommand(subcommand =>
            subcommand
                .setName('id')
                .setDescription('Find clan information by id')
                .addIntegerOption(option =>
                    option.setName('id')
                        .setDescription('Clan id')
                        .setRequired(true)
                )
        ),
    async execute(client, interaction) {
        const id = interaction.options.getInteger('id');
        try {

            const data = await getClan(id);

            if (!data || !data.clan) {
                return interaction.reply({ content: 'Clan not found!', ephemeral: true });
            }
            const embed = buildClanEmbed(data);

            if (!embed) {
                return interaction.reply({ content: 'An error occured while building clan embed!', ephemeral: true });
            }

            return interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: 'An error occured while fetching clan!', ephemeral: true });
        }
    }
}
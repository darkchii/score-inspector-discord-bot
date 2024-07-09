const { SlashCommandBuilder } = require('@discordjs/builders');
const { CLAN_STATS, getClans, buildClanListEmbed, EMBED_CLAN_LIMIT, getClan, buildClanEmbed } = require('../utils/clans');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    register_command: new SlashCommandBuilder()
        .setName('clan')
        .setDescription('Show clan information')
        //either id or clan tag
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The id of the clan')
        )
        .addStringOption(option =>
            option.setName('tag')
                .setDescription('The tag of the clan')
        ),
    async execute(client, interaction) {
        const id = interaction.options.getInteger('id');
        const tag = interaction.options.getString('tag');
        console.log(id, tag);
        try {

            const data = await getClan(id || tag, tag !== null);

            if (!data) {
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
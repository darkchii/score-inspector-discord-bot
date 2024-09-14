const { SlashCommandBuilder } = require('@discordjs/builders');
const { CLAN_STATS, getClans, buildClanListEmbed, EMBED_CLAN_LIMIT, getClan, buildClanEmbed, FOOTER_BASE } = require('../utils/clans');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const find_commands = require('../utils/initialisation/find_commands');
const config = require('../config.json');

module.exports = {
    register_command: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show general help or help for a specific command')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command to get help for')
                .setRequired(false)
        ),

    async execute(client, interaction) {
        const _commands = Object.values(client.commands).map(command => command.register_command);

        const command = interaction.options.getString('command');
        if(command){
            const cmd = _commands.find(cmd => cmd.name === command);
            if(!cmd){
                await interaction.reply({ content: `Command \`${command}\` not found`, ephemeral: true });
                return;
            }

            const embed = new EmbedBuilder()
                .setTitle('Help')
                .setTimestamp()
                .setFooter({ text: `${FOOTER_BASE}` })
                .setColor(config.COLOR)
                .addFields({
                    name: 'Description',
                    value: cmd.description,
                    inline: false
                });

            if(cmd.options){
                const options = cmd.options.map(option => {
                    return `**${option.name}** - ${option.description}`;
                }).join('\n');
                embed.addFields({
                    name: 'Options',
                    value: options,
                    inline: false
                });
            }

            await interaction.reply({ embeds: [embed] });
        }else{
            const embed = new EmbedBuilder()
                .setTitle('Help')
                .setDescription('Here is a list of all the commands you can use')
                .setTimestamp()
                .setFooter({ text: `${FOOTER_BASE}` })
                .setColor(config.COLOR);

            _commands.forEach(cmd => {
                embed.addFields({
                    name: cmd.name,
                    value: cmd.description,
                    inline: false
                });
            });

            await interaction.reply({ embeds: [embed] });
        }
    }
}
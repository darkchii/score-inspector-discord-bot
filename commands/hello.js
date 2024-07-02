const { SlashCommandBuilder } = require('@discordjs/builders');
const Discord = require('discord.js')

module.exports = {
    register_command: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong!'),
    async execute(client, interaction) {
        return interaction.reply({ content: `Pong!` })
    }
}
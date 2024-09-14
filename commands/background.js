const { SlashCommandBuilder } = require('@discordjs/builders');
const { CLAN_STATS, getClans, buildClanListEmbed, EMBED_CLAN_LIMIT, getClan, buildClanEmbed, FOOTER_BASE } = require('../utils/clans');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { default: axios } = require('axios');
const config = require('../config.json');

module.exports = {
    register_command: new SlashCommandBuilder()
        .setName('background')
        .setDescription('Get the background image of a specific beatmap (NOT beatmapset!)')
        //either id or clan tag
        .addIntegerOption(option =>
            option.setName('beatmap_id')
                .setDescription('The id of the beatmap (NOT the set!)')
        ),
    async execute(client, interaction) {
        const beatmap_id = interaction.options.getInteger('beatmap_id');
        try {

            const image_url = `https://bg.kirino.sh/get/${beatmap_id}`;
            const beatmap_data_url = `https://api.kirino.sh/inspector/beatmaps/${beatmap_id}`;

            //first, get the beatmap data
            const response = await axios.get(beatmap_data_url);
            const beatmap_data = response.data;

            if(beatmap_data){
                //remove modded_sr from the data, makes dev work easier
                delete beatmap_data.modded_sr;
            }

            //check image_url response code
            const image_response = await axios.get(image_url);
            if(image_response.status !== 200){
                return interaction.reply({ content: `An error occured while fetching background image!`, ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(`${beatmap_data.artist} - ${beatmap_data.title} [${beatmap_data.diffname}]`)
                .setDescription(`Beatmap difficulty background image`)
                .setURL(`https://osu.ppy.sh/beatmaps/${beatmap_data.beatmap_id}`)
                .setFooter({ text: `${FOOTER_BASE}` })
                .setImage(image_url)
                .setColor(config.COLOR);

            // return interaction.reply({ embeds: [embed] });
            //check if we are timed out (it can take a few seconds for the image to be fetched)
            await interaction.deferReply();
            return interaction.editReply({ embeds: [embed] });

            // //we want to send the image as a file, not url
            // const embed = new EmbedBuilder()
            //     .setTitle(`[${data.tag}] ${data.name}`)
            //     .setDescription(data.description)
            //     .setTimestamp()
            //     .setFooter({ text: `${FOOTER_BASE}` })
            //     .setColor(color);

            // return interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: 'An error occured while fetching background!', ephemeral: true });
        }
    }
}
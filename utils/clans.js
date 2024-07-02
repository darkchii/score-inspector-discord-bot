const { default: axios } = require('axios');
const config = require('../config.json');
const { EmbedBuilder } = require('discord.js');
const EMBED_CLAN_LIMIT = 5;

const CLAN_STATS = [
    {
        name: 'Performance',
        value: 'average_pp',
        format: (value) => `**${(Math.round(value * 100) / 100).toLocaleString('en-US')}**pp`
    }, {
        name: 'Total PP',
        value: 'total_pp',
        format: (value) => `**${(Math.round(value * 100) / 100).toLocaleString('en-US')}**pp`
    }, {
        name: 'Ranked Score',
        value: 'ranked_score',
        format: (value) => `**${value.toLocaleString('en-US')}** ranked score`
    },{
        name: 'Total Score',
        value: 'total_score',
        format: (value) => `**${value.toLocaleString('en-US')}** total score`
    },{
        name: 'Total SS',
        value: 'total_ss_both',
        format: (value) => `**${value.toLocaleString('en-US')}** SS`
    }, {
        name: 'Total S',
        value: 'total_s_both',
        format: (value) => `**${value.toLocaleString('en-US')}** S`
    }, {
        name: 'Total A',
        value: 'total_a',
        format: (value) => `**${value.toLocaleString('en-US')}** A`
    }, {
        name: 'Total B',
        value: 'total_b',
        format: (value) => `**${value.toLocaleString('en-US')}** B`
    }, {
        name: 'Total C',
        value: 'total_c',
        format: (value) => `**${value.toLocaleString('en-US')}** C`
    }, {
        name: 'Total D',
        value: 'total_d',
        format: (value) => `**${value.toLocaleString('en-US')}** D`
    }, {
        name: 'Playcount',
        value: 'playcount',
        format: (value) => `**${value.toLocaleString('en-US')}**`
    }, {
        name: 'Playtime',
        value: 'playtime',
        //format playtime in hours
        format: (value) => `**${(Math.floor(value / 3600)).toLocaleString('en-US')}** hours`
    }
]

async function getClans(page, sort) {
    try {
        const data = await axios.get(`${config.API_URL}/clans/list?page=${page}&sort=${sort}&limit=${EMBED_CLAN_LIMIT}`);
        return data.data;
    } catch (err) {
        console.error(err);
        return null;
    }
}

function buildClanListEmbed(data) {
    try {

        //find first clan with header_img_url and use that as the thumbnail
        const thumb = data.clans.find(clan => clan.header_image_url)?.header_image_url;

        const embed = new EmbedBuilder()
            .setTitle('Clans')
            .setThumbnail(thumb)
            .setDescription(`Showing clans sorted by ${CLAN_STATS.find(stat => stat.value === data.sort).name}`)
            .setFooter({ text: `Page ${data.page}/${data.total_pages}` })
            .setTimestamp();

        data.clans.forEach(clan => {
            const _sorter = CLAN_STATS.find(stat => stat.value === data.sort);
            const rank_position = data.clans.indexOf(clan) + 1 + (data.page - 1) * EMBED_CLAN_LIMIT;
            const unix_creation_date = new Date(clan.creation_date).getTime();

            const name = `#${rank_position} [${clan.tag}] ${clan.name}`;
            //link to the clan page
            const value = `${_sorter.format(clan.clan_stats?.[_sorter.value])}\n` +
                `[Website](${config.WEBSITE_URL}/clans/${clan.id}) | Created <t:${unix_creation_date / 1000}:R>`;
            embed.addFields({ name: name, value: value });
        });

        return embed;
    } catch (err) {
        console.error(err);
        return null;
    }
}

module.exports = {
    getClans,
    buildClanListEmbed,
    CLAN_STATS,
    EMBED_CLAN_LIMIT
}

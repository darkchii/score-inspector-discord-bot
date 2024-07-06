const { default: axios } = require('axios');
const config = require('../config.json');
const { EmbedBuilder } = require('discord.js');
const validateColor = require("validate-color").default;
const EMBED_CLAN_LIMIT = 5;

const CLAN_STATS = [
    {
        name: 'Performance',
        value: 'average_pp',
        format: (value, with_title = true) => `**${(Math.round(value * 100) / 100).toLocaleString('en-US')}**${with_title ? 'pp' : ''}`
    }, {
        name: 'Total PP',
        value: 'total_pp',
        format: (value, with_title = true) => `**${(Math.round(value * 100) / 100).toLocaleString('en-US')}**${with_title ? 'pp' : ''}`
    }, {
        name: 'Ranked Score',
        value: 'ranked_score',
        format: (value, with_title = true) => `**${value.toLocaleString('en-US')}** ${with_title ? 'ranked score' : ''}`
    }, {
        name: 'Total Score',
        value: 'total_score',
        format: (value, with_title = true) => `**${value.toLocaleString('en-US')}** ${with_title ? 'total score' : ''}`
    }, {
        name: 'Total SS',
        value: 'total_ss_both',
        format: (value, with_title = true) => `**${value.toLocaleString('en-US')}** ${with_title ? 'SS' : ''}`
    }, {
        name: 'Total S',
        value: 'total_s_both',
        format: (value, with_title = true) => `**${value.toLocaleString('en-US')}** ${with_title ? 'S' : ''}`
    }, {
        name: 'Total A',
        value: 'total_a',
        format: (value, with_title = true) => `**${value.toLocaleString('en-US')}** ${with_title ? 'A' : ''}`
    }, {
        name: 'Total B',
        value: 'total_b',
        format: (value, with_title = true) => `**${value.toLocaleString('en-US')}** ${with_title ? 'B' : ''}`
    }, {
        name: 'Total C',
        value: 'total_c',
        format: (value, with_title = true) => `**${value.toLocaleString('en-US')}** ${with_title ? 'C' : ''}`
    }, {
        name: 'Total D',
        value: 'total_d',
        format: (value, with_title = true) => `**${value.toLocaleString('en-US')}** ${with_title ? 'D' : ''}`
    }, {
        name: 'Playcount',
        value: 'playcount',
        format: (value, with_title = true) => `**${value.toLocaleString('en-US')}**`
    }, {
        name: 'Playtime',
        value: 'playtime',
        //format playtime in hours
        format: (value, with_title = true) => `**${(Math.floor(value / 3600)).toLocaleString('en-US')}** hours`
    }, {
        name: 'Members',
        value: 'members',
        format: (value, with_title = true) => `**${value}** ${with_title ? 'members' : ''}`
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

async function getClan(id) {
    try {
        const data = await axios.get(`${config.API_URL}/clans/get/${id}`);
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

function buildClanEmbed(data) {
    if(!data.clan) return null;
    try {
        let color = '#000000';

        if (data.clan.color && validateColor('#' + data.clan.color)) {
            color = '#' + data.clan.color;
        }
        const embed = new EmbedBuilder()
            .setTitle(`[${data.clan.tag}] ${data.clan.name}`)
            .setDescription(data.clan.description)
            .setTimestamp()
            .setColor(color);

        if(data.clan.header_image_url) {
            embed.setThumbnail(data.clan.header_image_url);
        }

        let fieldCount = 0;
        CLAN_STATS.forEach(stat => {
            if (data.stats?.[stat.value] !== undefined && data.ranking?.[stat.value] !== undefined) {
                const _stat = data.stats?.[stat.value];
                const rank = data.ranking?.[stat.value];
                embed.addFields({
                    name: stat.name,
                    // value: stat.format(data.stats?.[stat.value], false),
                    value: `${stat.format(_stat, false)}\n#${rank.toLocaleString('en-US')}`,
                    inline: true
                });
                fieldCount++;
            }
        });

        //add an empty field if the buttom row only has 2 fields
        if (fieldCount % 3 === 2) {
            embed.addFields({ name: '\u200b', value: '\u200b', inline: true });
        }

        //add owner field
        if(data.owner){
            embed.addFields({
                name: 'Owner',
                value: `[${data.owner.user.inspector_user.known_username}](https://osu.ppy.sh/users/${data.owner.user.inspector_user.osu_id})`,
            })
        }

        return embed;
    } catch (err) {
        console.error(err);
        return null;
    }
}

module.exports = {
    getClans,
    getClan,
    buildClanListEmbed,
    buildClanEmbed,
    CLAN_STATS,
    EMBED_CLAN_LIMIT
}

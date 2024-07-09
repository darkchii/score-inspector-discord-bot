const { default: axios } = require('axios');
const config = require('../config.json');
const { EmbedBuilder } = require('discord.js');
const { query } = require('./db');
const validateColor = require("validate-color").default;
const EMBED_CLAN_LIMIT = 5;

const FOOTER_BASE = 'Bot by Amayakase';

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
        name: 'Playcount',
        value: 'playcount',
        format: (value, with_title = true) => `**${value.toLocaleString('en-US')}**`
    }, {
        name: 'Playtime',
        value: 'playtime',
        //format playtime in hours
        format: (value, with_title = true) => `**${(Math.floor(value / 3600)).toLocaleString('en-US')}** hours`
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
        name: 'Members',
        value: 'members',
        format: (value, with_title = true) => `**${value}** ${with_title ? 'members' : ''}`
    }
]

async function getClans(page, sort) {
    try {
        const _query = `
            SELECT * FROM inspector_clans 
            INNER JOIN inspector_clan_stats ON inspector_clans.id = inspector_clan_stats.clan_id
            ORDER BY ? DESC LIMIT ? OFFSET ?`;
        const response = await query(_query, [sort, EMBED_CLAN_LIMIT, (page - 1) * EMBED_CLAN_LIMIT]);
        const total_clans = await query('SELECT COUNT(*) as count FROM inspector_clans');
        return {
            clans: response,
            total_clans: Number(total_clans[0].count)
        }
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function getClan(id, isTag = false) {
    try {
        //detect if the id is a tag or an id
        if (isTag) {
            const response = await query('SELECT * FROM inspector_clans WHERE tag = ?', [id]);
            if (response.length === 0) return null;
            id = response[0].id;
        }
        const response = await query('SELECT * FROM inspector_clans WHERE id = ?', [id]);
        if (response.length === 0) return null;

        const members = await getClanMembers(id);
        response[0].members = members;

        const { stats, ranking } = await getClanStats(id);
        response[0].stats = stats;
        response[0].ranking = ranking;

        return response[0];
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function getClanMembers(id) {
    try {
        const response = await query(`
            SELECT inspector_users.*, inspector_clan_members.join_date FROM inspector_clan_members 
            JOIN inspector_users ON inspector_clan_members.osu_id = inspector_users.osu_id
            WHERE clan_id = ? AND pending = 0`, [id]);
        return response;
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function getClanStats(id) {
    try {
        const all_stats = await query('SELECT * FROM inspector_clan_stats');
        if (all_stats.length === 0) return null;

        const clan_stats = all_stats.find(stat => stat.clan_id === id);
        if (!clan_stats) return null;

        let rankings = [];
        for (const val in clan_stats) {
            if (val === 'clan_id') continue;
            all_stats.sort((a, b) => Number(b[val]) - Number(a[val]));
            const index = all_stats.findIndex(stat => stat.clan_id === id);
            rankings[val] = Number(index) + 1;
        }

        return {
            stats: clan_stats,
            ranking: rankings
        }
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
            .setFooter({ text: `${FOOTER_BASE} - Page ${data.page}/${data.total_pages}` })
            .setTimestamp();

        data.clans.forEach(clan => {
            const _sorter = CLAN_STATS.find(stat => stat.value === data.sort);
            const rank_position = data.clans.indexOf(clan) + 1 + (data.page - 1) * EMBED_CLAN_LIMIT;
            const unix_creation_date = new Date(clan.creation_date).getTime();

            const name = `#${rank_position} [${clan.tag}] ${clan.name}`;
            //link to the clan page
            const value = `${_sorter.format(Number(clan?.[_sorter.value]))}\n` +
                `[Website](${config.WEBSITE_URL}/clan/${clan.id}) | Created <t:${unix_creation_date / 1000}:R>`;
            embed.addFields({ name: name, value: value });
        });

        return embed;
    } catch (err) {
        console.error(err);
        return null;
    }
}

function buildClanEmbed(data) {
    if (!data) return null;
    try {
        let color = '#000000';

        if (data.color && validateColor('#' + data.color)) {
            color = '#' + data.color;
        }
        const embed = new EmbedBuilder()
            .setTitle(`[${data.tag}] ${data.name}`)
            .setDescription(data.description)
            .setTimestamp()
            .setFooter({ text: `${FOOTER_BASE}` })
            .setColor(color);

        if (data.header_image_url) {
            embed.setThumbnail(data.header_image_url);
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

        
        //add owner field
        const owner = data.members.find(member => member.osu_id === data.owner);
        if (owner) {
            embed.addFields({
                name: 'Owner',
                value: `[${owner.known_username}](https://osu.ppy.sh/users/${owner.osu_id})`,
                inline: true
            });
            fieldCount++;
        }
        
        if (fieldCount % 3 === 2) {
            embed.addFields({ name: '\u200b', value: '\u200b', inline: true });
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

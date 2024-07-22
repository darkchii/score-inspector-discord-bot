const { SlashCommandBuilder } = require('@discordjs/builders');
const { FOOTER_BASE } = require('../utils/clans');
const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const WeatherBase = require('../utils/weather/WeatherBase');

module.exports = {
    register_command: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Show the weather of a given location')
        .addStringOption(option =>
            option.setName('location')
                .setDescription('Location to get the weather for (city, country)')
                .setRequired(true)
        ),

    async execute(client, interaction) {
        const location = interaction.options.getString('location');
        try{
            const data = await WeatherBase.getWeather(location);
            if(!data){
                throw new Error('No data found');
            }

            const embed = new EmbedBuilder();
            const localTime = new Date(data.location.localtime);

            let nextHourIndex = localTime.getHours() + 1;
            if(nextHourIndex > 23){
                nextHourIndex = 0;
            }

            //only show HH:MM
            embed.setTitle(`Weather in **${data.location.name}, ${data.location.country}** (${localTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })})`);
            embed.setFields({
                name: 'Current Conditions',
                value: `
                    **${data.current.condition.text}** at **${data.current.temp_c}°C** / **${data.current.temp_f}°F** (*Feels like **${data.current.feelslike_c}°C** / **${data.current.feelslike_f}°F***)
                    Humidity: **${data.current.humidity}%**, Wind: **${data.current.wind_kph} km/h** / **${data.current.wind_mph} mph** from **${data.current.wind_dir}** ${WeatherBase.getWindDirectionEmoji(data.current.wind_dir)}`,
            }, {
                name: 'Forecast',
                value: `
                    *Next hour*
                    __**${data.forecast.forecastday[0].hour[nextHourIndex].condition.text}** at **${data.forecast.forecastday[0].hour[nextHourIndex].temp_c}°C** / **${data.forecast.forecastday[0].hour[nextHourIndex].temp_f}°F**__
                    *Tomorrow*
                    __**${data.forecast.forecastday[1].day.condition.text}** at **${data.forecast.forecastday[1].day.avgtemp_c}°C** / **${data.forecast.forecastday[1].day.avgtemp_f}°F**__`
            });

            embed.setThumbnail(`https:${data.current.condition.icon}`);
            embed.setTimestamp();
            embed.setFooter({ text: `${FOOTER_BASE}` });
            embed.setColor(config.COLOR);

            await interaction.reply({ embeds: [embed] });
        }catch(err){
            console.error(err);
            await interaction.reply({ content: 'Couldn\'t get weather information', ephemeral: true });
        }
    }
}
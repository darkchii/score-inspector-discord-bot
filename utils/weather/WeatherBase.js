const { default: axios } = require('axios');

require('dotenv').config();

class WeatherBase {
    static getBaseUrl() {
        return 'http://api.weatherapi.com/v1/';
    }

    static getWeatherUrl(location) {
        return `${this.getBaseUrl()}forecast.json?key=${process.env.WEATHER_API_KEY}&q=${location}&days=2`;
    }

    static async getWeather(location) {
        const data = await axios.get(this.getWeatherUrl(location));
        return data.data;
    }

    static getWindDirectionEmoji(windDir){
        //example:
        //NNE, NE, ENE gets the arrow pointing bottom left
        //N gets the arrow pointing down
        //(oppisite of the actual direction)

        switch(windDir){
            case 'N':
                return '⬇️';
            case 'NNE':
            case 'NE':
            case 'ENE':
                return '↙️';
            case 'E':
                return '⬅️';
            case 'ESE':
            case 'SE':
            case 'SSE':
                return '↖️';
            case 'S':
                return '⬆️';
            case 'SSW':
            case 'SW':
            case 'WSW':
                return '↗️';
            case 'W':
                return '➡️';
            case 'WNW':
            case 'NW':
            case 'NNW':
                return '↘️';
            default:
                return '';
        }
    }
}

module.exports = WeatherBase;
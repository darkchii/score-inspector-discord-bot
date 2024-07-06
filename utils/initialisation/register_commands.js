const { REST, Routes } = require('discord.js');
const log = new require('../logger.js')
const logger = new log("Command register")

module.exports = async (client, commands) => {
    if (!commands || commands.length == 0) return logger.info("No commands to register")
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
        logger.info(`Registering ${commands.length} command${commands.length > 1 ? "s" : ""} to the discord api ...`)

        const data = await rest.put(
            // Routes.applicationCommands(client.user.id),
            //if process.env.ENVIROMENT is not production, register commands to the test guild
            // Routes.applicationGuildCommands(client.user.id, process.env.DISCORD_GUILD),
            process.env.ENVIROMENT === 'production' ? Routes.applicationCommands(client.user.id) : Routes.applicationGuildCommands(client.user.id, process.env.DISCORD_GUILD),
            { body: commands },
        );

        logger.success(`Successfully registered ${data.length} application (/) command${data.length > 1 ? "s" : ""}.`);
    } catch (error) {
        logger.error(error)
    }
}
fs = require('node:fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
};

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    // use this for guid commands (commands that only work for a single guild)
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    // use this for global commands (don't use if testing)
    // await rest.put(
    //   Routes.applicaitonGuildCommands(clientId, guildId),
    //   { body: commands },
    // );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.log(error);
  }
})();
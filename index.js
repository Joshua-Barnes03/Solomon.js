// pull in the discord.js classes
const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
// acquire token
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({intents: [Intents.FLAGS.GUILDS]});

// searchs events directory for all the .js files and collects them
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    // when the client is ready, run this code once
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
};

// creatses a collection to hold the commands in
client.commands = new Collection();
// searches commands directory for all .js files and collects them
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // Set a new item in the Collection
  // With a key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);
};

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
  }
});

// Login to Discord with client's token
client.login(token);
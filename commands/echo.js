const { SlashCommandBuilder, SlashCommandStringOption } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Repeats back user input')
    .addStringOption(option =>
      new SlashCommandStringOption()
      .setName('input')
      .setDescription('what will be repeated back')
      .setRequired(true)),
    async execute(interaction) {
      const string = interaction.options.getString('input');
      await interaction.reply(`${string}`)
    }
}
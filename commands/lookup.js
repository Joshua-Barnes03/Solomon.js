const axios = require('axios').default;
const convert = require('xml-js');
const { SlashCommandBuilder, SlashCommandStringOption } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('lookup')
  .setDescription('Looks up information about a board game on BGG')
  .addStringOption(option =>
    new SlashCommandStringOption()
    .setName('game')
    .setDescription('The board game to look up')
    .setRequired(true)),
  async execute(interaction) {
    let string = interaction.options.getString('game');
    string = string.split(' ').join('+');
    const response = await axios.get(`https://boardgamegeek.com/xmlapi2/search?exact=1&query=${string}`)
      .then(response => {
        response = convert.xml2js(response.data, {compact: true, spaces: 2});
        if (response.items.item === undefined) return {error: true};
        const id = response.items.item[0]._attributes.id
        const name = response.items.item[0].name._attributes.value
        return {id, name}
      })
      .catch(error => {
        console.error(error);
        return {error: true}
      })
    if (response.error || ((response.id || response.name) === undefined)) {
      await interaction.reply(`I was unable to find that one. Are you sure ${string} is what you are looking for?`);
      return
    };
    const stats = await axios.get(`https://boardgamegeek.com/xmlapi2/thing?id=${response.id}&stats=1`)
      .then(response => {
        response = convert.xml2js(response.data, {compact: true, spaces: 2});
        let details = response.items.item
        let ratings = details.statistics.ratings
        return {
          playCount: {min: details.minplayers._attributes.value, max: details.maxplayers._attributes.value},
          playTime: {min: details.minplaytime._attributes.value, max: details.maxplaytime._attributes.value},
          age: details.minage._attributes.value,
          score: Math.round(ratings.average._attributes.value * 10) / 10,
          rank: Array.isArray(ratings.ranks.rank) ? ratings.ranks.rank[0]._attributes.value : ratings.ranks.rank._attributes.value,
          weight: Math.round(ratings.averageweight._attributes.value * 100) / 100
        }
      })
      .catch(error => {
        console.error(error);
        return {error: true}
      })
    if (stats.error) {
      await interaction.reply(`I grow weary. Why don't you try looking that up on BGG yourself.`);
      return
    };
    let extra = ''
    if (response.name === 'Gloomhaven') extra = ' This one is my personal favorite.';
    await interaction.reply(`${response.name} is a game for ${stats.playCount.min} to ${stats.playCount.max} players. Make sure you have ${stats.playTime.min} to ${stats.playTime.max} minutes to play. It has a weighted complexity rating of ${stats.weight}. It's ranked ${stats.rank} out of all games with a score of ${stats.score}.${extra}`);
  },
};
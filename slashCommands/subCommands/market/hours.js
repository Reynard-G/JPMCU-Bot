const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const moment = require('moment');

module.exports = {
    name: 'hours',
    description: "Check if the market is open or closed.",
    run: async (client, interaction) => {
        const clock = await client.alpaca.getClock()

        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: `Market Hours`, iconURL: `https://raw.githubusercontent.com/Reynard-G/JPMCU-Bot/master/assets/markethours.gif` })
                    .addFields(
                        { name: 'Market Status', value: `The market is currently ${clock.is_open ? 'open' : 'closed'}.`, inline: true },
                        { name: 'Next Market Status', value: `The market will be ${clock.next_open ? 'open' : 'closed'} at <t:${moment(clock.next_open ? clock.next_open : clock.next_close).unix()}:f>.`, inline: true }
                    )
                    .setColor('2F3136')
                    .setTimestamp()
                    .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
            ]
        })
    }
};

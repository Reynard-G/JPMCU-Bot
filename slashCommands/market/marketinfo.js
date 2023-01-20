const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const fs = require('fs');
const moment = require('moment');

module.exports = {
    name: 'marketinfo',
    description: "Check the price of a stock/crypto.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [
        {
            name: 'ticker',
            description: 'The ticker of the stock you want to check the price of.',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async (client, interaction) => {
        // Defer the reply so the bot doesn't time out
        await interaction.deferReply({ ephemeral: true });

        // Check if the ticker is valid
        const ticker = interaction.options.getString('ticker').toUpperCase();
        if (!client.stockTickers.includes(ticker) && !client.cryptoTickers.includes(ticker)) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Invalid Ticker')
                        .setDescription(`The ticker \`${ticker}\` is not valid. You can view an available list of tickers using \`/tickers\`.`)
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }

        const price = JSON.parse(fs.readFileSync(`data/${client.stockTickers.includes(ticker) ? 'stockMarket' : 'cryptoMarket'}.json`, 'utf8'))[ticker].Price;
        const updated = JSON.parse(fs.readFileSync(`data/${client.stockTickers.includes(ticker) ? 'stockMarket' : 'cryptoMarket'}.json`, 'utf8'))[ticker].Timestamp;
        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: `Market Information`, iconURL: `https://raw.githubusercontent.com/Reynard-G/JPMCU-Bot/master/assets/marketinfo.gif` })
                    .addFields(
                        { name: 'Ticker', value: ticker, inline: true },
                        { name: 'Price', value: `$${price}`, inline: true },
                        { name: 'Last Updated', value: `<t:${moment(updated).unix()}:f>`, inline: true }
                    )
                    .setColor('2F3136')
                    .setTimestamp()
                    .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
            ]
        });
    }
};

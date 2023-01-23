const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const moment = require('moment');

module.exports = {
    name: 'info',
    description: "Check the price of a stock/crypto.",
    run: async (client, interaction) => {
        // Defer the reply so the bot doesn't time out
        await interaction.deferReply({ ephemeral: true });

        // Check if the ticker is valid
        const ticker = interaction.options.getString('ticker').toUpperCase();
        if (!(ticker in client.cryptoTickers) && !(ticker in client.stockTickers)) {
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

        const name = Object.keys(client.cryptoTickers).includes(ticker) ? client.cryptoTickers[ticker] : client.stockTickers[ticker];
        const price = JSON.parse(fs.readFileSync(`data/${Object.keys(client.stockTickers).includes(ticker) ? 'stockMarket' : 'cryptoMarket'}.json`, 'utf8'))[ticker].Price;
        const updated = JSON.parse(fs.readFileSync(`data/${Object.keys(client.stockTickers).includes(ticker) ? 'stockMarket' : 'cryptoMarket'}.json`, 'utf8'))[ticker].Timestamp;
        const imageChart = new AttachmentBuilder(`data/charts/${ticker}BarChart.png`)

        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: `Market Information`, iconURL: `https://raw.githubusercontent.com/Reynard-G/JPMCU-Bot/master/assets/marketinfo.gif` })
                    .addFields(
                        { name: 'Ticker', value: `${ticker} (${name})`, inline: true },
                        { name: 'Price', value: `$${price}`, inline: true },
                        { name: 'Last Updated', value: `<t:${moment(updated).unix()}:f>`, inline: true }
                    )
                    .setImage(`attachment://${ticker}BarChart.png`)
                    .setColor('2F3136')
                    .setTimestamp()
                    .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
            ],
            files: [
                imageChart
            ]
        });
    }
};

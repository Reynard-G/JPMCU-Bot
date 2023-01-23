const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    name: 'market',
    description: "Information about JPMCU.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [
        {
            name: 'tickers',
            description: 'The ticker of the stock you want to check the price of.',
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'hours',
            description: 'Check if the market is open or closed.',
            type: ApplicationCommandOptionType.Subcommand
        },
        {
            name: 'info',
            description: 'Check the price of a stock/crypto.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'ticker',
                    description: 'The ticker of the stock you want to check the price of.',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'chartinfo',
            description: 'How to understand a candlestick chart as displayed in /market info.',
            type: ApplicationCommandOptionType.Subcommand
        }
    ],
};

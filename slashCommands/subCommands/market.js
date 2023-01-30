const { ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    name: "market",
    description: "Information about JPMCU.",
    type: ApplicationCommandType.ChatInput,
    dm_permission: false,
    cooldown: 3000,
    options: [
        {
            name: "tickers",
            description: "The ticker of the stock you want to check the price of.",
            type: ApplicationCommandOptionType.Subcommand,
            cooldown: 3000,
        },
        {
            name: "hours",
            description: "Check if the market is open or closed.",
            type: ApplicationCommandOptionType.Subcommand,
            cooldown: 3000,
        },
        {
            name: "info",
            description: "Check the price of a stock/crypto.",
            type: ApplicationCommandOptionType.Subcommand,
            cooldown: 3000,
            options: [
                {
                    name: "ticker",
                    description: "The ticker of the stock you want to check the price of.",
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: "chartinfo",
            description: "How to understand a candlestick chart as displayed in /market info.",
            type: ApplicationCommandOptionType.Subcommand,
            cooldown: 3000,
        },
        {
            name: "buy",
            description: "Buy a share of a company",
            type: ApplicationCommandOptionType.Subcommand,
            cooldown: 3000,
            options: [
                {
                    name: "ticker",
                    description: "The ticker of the company you want to buy",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "amount",
                    description: "The amount of shares you want to buy",
                    type: ApplicationCommandOptionType.Integer,
                    min_value: 1,
                    required: true
                }
            ],
        }
    ],
};

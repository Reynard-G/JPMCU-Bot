const { EmbedBuilder } = require("discord.js");
const Decimal = require("decimal.js");
const fs = require("fs");
const checkUser = require("../../../utils/checkUser.js");
const checkMarket = require("../../../utils/checkMarket.js");

module.exports = {
    name: "sell",
    run: async (client, interaction) => {
        // Defer the reply so the bot doesn't time out
        await interaction.deferReply({ ephemeral: true });

        const ticker = interaction.options.getString("ticker").toUpperCase();
        const amount = interaction.options.getInteger("amount");

        // Check if ticker exists
        if (!(await checkMarket.tickerExists(client, interaction, ticker))) return;

        // Get the stock price from data/stockMarket.json or data/cryptoMarket.json depending on the ticker type (stock or crypto)
        const stockData = await checkMarket.tickerType(client, ticker) === "stock" ? JSON.parse(fs.readFileSync("./data/stockMarket.json")) : JSON.parse(fs.readFileSync("./data/cryptoMarket.json"));
        const sharePrice = stockData[ticker].Price;

        // Check if the user has enough shares to sell
        const portfolio = await checkMarket.portfolio(client, interaction.user.id);
        if (portfolio[ticker] < amount || portfolio[ticker] === undefined) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Not Enough Shares")
                        .setDescription(`You do not have enough shares to sell.`)
                        .setColor("Red")
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }

        // Update the user's balance and stocks
        const totalPrice = Decimal.mul(sharePrice, amount).toLocaleString();
        const transactionID = (await client.query(`INSERT INTO transactions (user_id, currency_id, amount, dr_cr, type, method, status, note, created_user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()); SELECT LAST_INSERT_ID()`, [await checkUser.id(client, interaction.user.id), 4, totalPrice, "cr", "Withdraw", "JPMCU Bot", 2, `Sold ${amount} shares of ${ticker} for $${totalPrice}`, await checkUser.id(client, interaction.user.id)]))[1][0]["LAST_INSERT_ID()"];
        await client.query(`INSERT INTO stockmarket_transactions (user_id, name, ticker, amount, price, type, created_user_id, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [await checkUser.id(client, interaction.user.id), interaction.user.id, ticker, amount, totalPrice, "sell", interaction.user.id, transactionID]);

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: "Shares Sold", iconURL: "https://raw.githubusercontent.com/Reynard-G/JPMCU-Bot/master/assets/marketbuysell.gif" })
                    .setDescription(`Your sale has been completed. \nYour sell order details can be seen below.`)
                    .addFields(
                        {
                            name: "Details",
                            value:
                                `Ticker: **${ticker}**` +
                                `\nAmount: **${amount}**` +
                                `\nPrice Per Share: **$${sharePrice.toLocaleString()}**` +
                                `\nTotal: **$${totalPrice}**`
                        }
                    )
                    .setColor("Green")
                    .setTimestamp()
                    .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
            ]
        });
    }
};

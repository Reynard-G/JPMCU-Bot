const { EmbedBuilder } = require("discord.js");

exports.tickerExists = async function (client, interaction, ticker, deferred = true) {
    const embed = new EmbedBuilder()
        .setTitle("Invalid Ticker")
        .setDescription(`The ticker \`${ticker}\` does not exist. Please try again.`)
        .setColor("Red")
        .setTimestamp()
        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() });

    if (!Object.keys(client.stockTickers).includes(ticker)) {
        await (deferred ? interaction.editReply({ embeds: [embed] }) : interaction.reply({ embeds: [embed] }));
        return false;
    } else {
        return true;
    }
};

exports.tickerType = async function (client, ticker) {
    // Check if ticker is a stock or crypto
    return client.stockTickers[ticker] ? "stock" : "crypto";
};

exports.portfolio = async function (client, userID) {
    const transactions = await client.query("SELECT * FROM stockmarket_transactions WHERE name = ?", [userID]);
    const portfolio = transactions.reduce((acc, cur) => {
        if (cur.type === "sell") {
            acc[cur.ticker] = acc[cur.ticker] ? acc[cur.ticker] - cur.amount : -cur.amount;
        } else {
            acc[cur.ticker] = acc[cur.ticker] ? acc[cur.ticker] + cur.amount : cur.amount;
        }
        return acc;
    }, {});
    // Remove any stocks with 0
    for (const ticker in portfolio) portfolio[ticker] || delete portfolio[ticker];
    
    return portfolio;
};

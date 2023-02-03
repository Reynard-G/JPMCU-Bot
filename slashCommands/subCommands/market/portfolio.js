const { EmbedBuilder } = require("discord.js");
const checkMarket = require("../../../utils/checkMarket.js");

module.exports = {
    name: "portfolio",
    run: async (client, interaction) => {
        const portfolio = await checkMarket.portfolio(client, interaction.user.id);

        // Display the user's portfolio
        const embed = new EmbedBuilder()
            .setTitle("Portfolio")
            .setDescription(`Your stock portfolio can be seen below.`)
            .setColor("2F3136")
            .setTimestamp()
            .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() });

        if (Object.keys(portfolio).length === 0) {
            // If the user has no stocks, display a message saying so
            embed.addFields({ name: "No Stocks", value: "You currently have no stocks." });
        } else {
            // If the user has stocks, display the stocks and their amounts
            const portfolioString = Object.entries(portfolio).map(([ticker, amount]) => `**${ticker}**: ${amount}`).join("\n");
            embed.addFields({ name: `** **`, value: `${portfolioString}` });
        }

        interaction.reply({
            ephemeral: true,
            embeds: [embed],
        });
    }
};

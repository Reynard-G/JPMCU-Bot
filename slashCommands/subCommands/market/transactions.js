const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { pageEmbed } = require("../../../utils/pagedEmbed.js");

module.exports = {
    name: "transactions",
    description: "Check your JPMCU stock market transaction history.",
    type: ApplicationCommandType.ChatInput,
    dm_permission: false,
    cooldown: 3000,
    run: async (client, interaction) => {
        // Convert date to unix time
        function convertToUnixTime(date) {
            return (Date.parse(`${date}`) / 1000);
        }

        // Defer the reply so the bot doesn't time out
        await interaction.deferReply({ ephemeral: true });

        try {
            // Dictionary of transaction types
            const types = {
                "buy": "📈",
                "sell": "📉"
            };

            // Get user"s transaction history
            const transactions = (await client.query(`SELECT * FROM stockmarket_transactions WHERE name = "${interaction.user.id}";`));

            // Create a embed page per 10 transactions and uses buttons to navigate between pages
            const pages = [];
            let embed = new EmbedBuilder()
                .setAuthor({ name: `Transaction History`, iconURL: `https://raw.githubusercontent.com/Reynard-G/JPMCU-Bot/master/assets/transactions.gif` })
                .setDescription(`For privacy reasons, you can only switch between pages of your transaction history for **5 minutes**.`)
                .setColor("#2F3136")
                .setTimestamp()
                .setFooter({ text: `JPMCU • Page 1 of ${Math.ceil(transactions.length / 10)}`, iconURL: interaction.guild.iconURL() });

            for (let i = 0; i < transactions.length; i++) {
                if (i % 10 === 0 && i !== 0) {
                    pages.push(embed);
                    embed = new EmbedBuilder()
                        .setAuthor({ name: `Transaction History`, iconURL: `https://raw.githubusercontent.com/Reynard-G/JPMCU-Bot/master/assets/transactions.gif` })
                        .setDescription(`For privacy reasons, you can only switch between pages of your transaction history for **5 minutes**.`)
                        .setColor("#2F3136")
                        .setTimestamp()
                        .setFooter({ text: `JPMCU • Page ${Math.ceil(i / 10) + 1} of ${Math.ceil(transactions.length / 10)}`, iconURL: interaction.guild.iconURL() });
                }

                embed.addFields({
                    name: `${types[transactions[i].type]} Transaction #${transactions[i].id}`,
                    value: `**Ticker:** ${transactions[i].ticker}` +
                        `\n**Type:** ${transactions[i].type.toUpperCase()}` +
                        `\n**Amount:** ${transactions[i].amount}` +
                        `\n**Price:** $${transactions[i].price}` +
                        `\n**Date:** <t:${convertToUnixTime(transactions[i].updated_at)}:F>`
                });
            }
            pages.push(embed);

            // Create buttons to navigate between pages
            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("previous")
                        .setLabel("Previous")
                        .setEmoji("⬅️")
                        .setStyle("Primary")
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId("next")
                        .setLabel("Next")
                        .setEmoji("➡️")
                        .setStyle("Primary")
                        .setDisabled(pages.length === 1)
                );

            pageEmbed(interaction, pages, buttons);
        } catch (err) {
            console.error(err);
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Stock Transaction History Check Failed")
                        .setDescription(`An error occurred while checking your transaction history. If this error persists, please contact a staff member by opening a ticket`)
                        .setColor("Red")
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }
    }
};

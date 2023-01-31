const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const checkUser = require("../../utils/checkUser.js");
const { pageEmbed } = require("../../utils/pagedEmbed.js");

module.exports = {
    name: "transactions",
    description: "Check your JPMCU account transaction history.",
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
            // Check if user is registered
            if (!(await checkUser.exists(client, interaction, interaction.user.id, true))) return;

            // Dictionary of transaction types
            const types = {
                "cr": "📈",
                "dr": "📉"
            };

            // Dictionary of statuses
            const statuses = {
                0: "Cancelled",
                1: "Pending",
                2: "Completed"
            };

            // Get user"s transaction history
            const userID = (await client.query(`SELECT id FROM users WHERE name = "${interaction.user.id}";`))[0].id;
            const transactions = (await client.query(`SELECT * FROM transactions WHERE user_id = "${userID}";`));

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
                        .setFooter({ text: `JPMCU • Page ${Math.ceil(i / 10)}/${Math.ceil(transactions.length / 10)}`, iconURL: interaction.guild.iconURL() });
                }

                embed.addFields(
                    {
                        name: `${types[transactions[i].dr_cr] ?? "💸"} Transaction #${transactions[i].id}`,
                        value: `Amount: $${transactions[i].amount}` +
                            `\nType: ${transactions[i].dr_cr}` +
                            `\nStatus: ${statuses[transactions[i].status] ?? "Unknown/Invalid"}` +
                            `\nDate: <t:${convertToUnixTime(transactions[i].updated_at)}:F>` +
                            `\nDescription: ${transactions[i].note}`
                    }
                );
            }
            pages.push(embed);

            // Create the buttons
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
                        .setTitle("Transaction History Check Failed")
                        .setDescription(`An error occurred while checking your transaction history. If this error persists, please contact a staff member by opening a ticket`)
                        .setColor("Red")
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }
    }
};

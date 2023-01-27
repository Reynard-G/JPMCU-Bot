const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const checkUser = require("../../utils/checkUser");

module.exports = {
    name: "transactions",
    description: "Check your JPMCU account transaction history.",
    type: ApplicationCommandType.ChatInput,
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
            if (!(await checkUser.userExists(client, interaction, interaction.user.id, true))) return;

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
            let page = 0;
            let embed = new EmbedBuilder()
                .setAuthor({ name: `Transaction History`, iconURL: `https://raw.githubusercontent.com/Reynard-G/JPMCU-Bot/master/assets/transactions.gif` })
                .setDescription(`For privacy reasons, you can only switch between pages of your transaction history for **5 minutes**.`)
                .setColor("#2F3136")
                .setTimestamp()
                .setFooter({ text: `JPMCU | Page ${page + 1}/${Math.ceil(transactions.length / 10)}`, iconURL: interaction.guild.iconURL() });

            for (let i = 0; i < transactions.length; i++) {
                if (i % 10 === 0 && i !== 0) {
                    pages.push(embed);
                    embed = new EmbedBuilder()
                        .setAuthor({ name: `Transaction History`, iconURL: `https://raw.githubusercontent.com/Reynard-G/JPMCU-Bot/master/assets/transactions.gif` })
                        .setDescription(`For privacy reasons, you can only switch between pages of your transaction history for **5 minutes**.`)
                        .setColor("#2F3136")
                        .setTimestamp()
                        .setFooter({ text: `JPMCU | Page ${page + 2}/${Math.ceil(transactions.length / 10)}`, iconURL: interaction.guild.iconURL() });
                    page++;
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

            // If the user has less than 10 transactions, just send the embed
            if (pages.length === 1) {
                return await interaction.editReply({
                    embeds: [pages[0]]
                });
            }

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

            // Send the first page
            const msg = await interaction.editReply({
                embeds: [pages[0]],
                components: [buttons]
            });

            // Create a collector for the buttons
            const filter = (button) => button.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 300000 });

            // When a button is pressed, edit the message with the new page
            page = 0;
            collector.on("collect", async (button) => {
                if (button.customId === "previous") {
                    page--;
                    buttons.components[0].setDisabled(page === 0);
                    buttons.components[1].setDisabled(false);
                    await button.update({
                        embeds: [pages[page]],
                        components: [buttons]
                    });
                } else if (button.customId === "next") {
                    page++;
                    buttons.components[0].setDisabled(false);
                    buttons.components[1].setDisabled(page === (pages.length - 1));
                    await button.update({
                        embeds: [pages[page]],
                        components: [buttons]
                    });
                }
            });

            // When the collector times out, disable the buttons
            collector.on("end", async () => {
                buttons.components[0].setDisabled(true);
                buttons.components[1].setDisabled(true);
                return await interaction.editReply({
                    embeds: [pages[page]],
                    components: [buttons]
                });
            });
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

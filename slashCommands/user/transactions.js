const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    name: 'transactions',
    description: "Check your JPMCU account transaction history.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    run: async (client, interaction) => {
        // Defer the reply so the bot doesn't time out
        await interaction.deferReply({ ephemeral: true });
        
        try {
            // Convert date to unix time
            function convertToUnixTime(date) {
                return (Date.parse(`${date}`) / 1000);
            }

            // Check if user is registered
            const userExists = (await client.query(`SELECT 1 FROM users WHERE name = '${interaction.user.id}';`));
            if (!((Object.keys(userExists).length > 0) && (userExists[0].hasOwnProperty('1')))) {
                return await interaction.editReply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Transaction History Check Failed')
                            .setDescription(`You are not registered with JPMCU. Please register by typing \`/register\`. If you believe this is an error, please contact a staff member by opening a ticket.`)
                            .setColor('Red')
                            .setTimestamp()
                            .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            }

            // Dictionary of transaction types
            const types = {
                'cr': '📈',
                'dr': '📉'
            };

            // Dictionary of statuses
            const statuses = {
                0: 'Cancelled',
                1: 'Pending',
                2: 'Completed'
            };

            // Get user's transaction history
            const userID = (await client.query(`SELECT id FROM users WHERE name = '${interaction.user.id}';`))[0].id;
            const transactions = (await client.query(`SELECT * FROM transactions WHERE user_id = '${userID}';`));

            // Create a embed page per 10 transactions and uses buttons to navigate between pages
            const pages = [];
            let page = 0;
            let embed = new EmbedBuilder()
                .setTitle('Transaction History')
                .setDescription(`For privacy reasons, you can only switch between pages of your transaction history for **5 minutes**.`)
                .setColor('#2F3136')
                .setTimestamp()
                .setFooter({ text: `JPMCU | Page ${page + 1}/${Math.ceil(transactions.length / 10)}`, iconURL: interaction.guild.iconURL() });

            for (let i = 0; i < transactions.length; i++) {
                if (i % 10 === 0 && i !== 0) {
                    pages.push(embed);
                    embed = new EmbedBuilder()
                        .setTitle('Transaction History')
                        .setDescription(`For privacy reasons, you can only switch between pages of your transaction history for **5 minutes**.`)
                        .setColor('#2F3136')
                        .setTimestamp()
                        .setFooter({ text: `JPMCU | Page ${page + 2}/${Math.ceil(transactions.length / 10)}`, iconURL: interaction.guild.iconURL() });
                    page++;
                }
                
                embed.addFields(
                    {
                        name: `${types[transactions[i].dr_cr] ?? '💸'} Transaction #${transactions[i].id}`,
                        value: `Amount: $${transactions[i].amount}` +
                        `\nType: ${transactions[i].dr_cr}` +
                        `\nStatus: ${statuses[transactions[i].status] ?? 'Unknown/Invalid'}` + 
                        `\nDate: <t:${convertToUnixTime(transactions[i].updated_at)}:F>` +
                        `\nDescription: ${transactions[i].note}`
                    }
                );
            }
            pages.push(embed);

            // If the user has less than 10 transactions, just send the embed
            if (pages.length === 1) {
                return await interaction.editReply({
                    ephemeral: true,
                    embeds: [pages[0]]
                });
            }

            // Send the first page
            const msg = await interaction.editReply({
                ephemeral: true,
                embeds: [pages[0]],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('previous')
                                .setLabel('Previous')
                                .setEmoji('⬅️')
                                .setStyle('Primary')
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('Next')
                                .setEmoji('➡️')
                                .setStyle('Primary')
                        )
                ]
            });

            // Create a collector for the buttons
            const filter = (button) => button.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 300000 });

            // When a button is pressed, edit the message with the new page
            page = 0;
            collector.on('collect', async (button) => {
                if (button.customId === 'next') {
                    page++;
                    await button.update({
                        ephemeral: true,
                        embeds: [pages[page]],
                        components: [
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('previous')
                                        .setLabel('Previous')
                                        .setEmoji('⬅️')
                                        .setStyle('Primary'),
                                    new ButtonBuilder()
                                        .setCustomId('next')
                                        .setLabel('Next')
                                        .setEmoji('➡️')
                                        .setStyle('Primary')
                                        .setDisabled(page === (pages.length - 1))
                                )
                        ]
                    });
                } else if (button.customId === 'previous') {
                    page--;
                    await button.update({
                        ephemeral: true,
                        embeds: [pages[page]],
                        components: [
                            new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('previous')
                                        .setLabel('Previous')
                                        .setEmoji('⬅️')
                                        .setStyle('Primary')
                                        .setDisabled(page === 0),
                                    new ButtonBuilder()
                                        .setCustomId('next')
                                        .setLabel('Next')
                                        .setEmoji('➡️')
                                        .setStyle('Primary')
                                )
                        ]
                    });
                }
            });

            // When the collector times out, disable the buttons
            collector.on('end', async () => {
                await interaction.editReply({
                    ephemeral: true,
                    embeds: [pages[page]],
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('previous')
                                    .setLabel('Previous')
                                    .setEmoji('⬅️')
                                    .setStyle('Primary')
                                    .setDisabled(true),
                                new ButtonBuilder()
                                    .setCustomId('next')
                                    .setLabel('Next')
                                    .setEmoji('➡️')
                                    .setStyle('Primary')
                                    .setDisabled(true)
                            )
                    ]
                });
            });
        } catch (err) {
            console.error(err);
            return await interaction.editReply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Transaction History Check Failed')
                        .setDescription(`An error occurred while checking your transaction history. If this error persists, please contact a staff member by opening a ticket`)
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }
    }
};

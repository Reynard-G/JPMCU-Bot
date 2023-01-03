const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    name: 'interest',
    description: "Apply interest to all accounts.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    default_member_permissions: 'Administrator',
    options: [
        {
            name: 'percentage',
            description: 'The percentage of interest to apply for all accounts. EX: 1.5% would be 1.5',
            type: 10,
            required: true
        }
    ],
    run: async (client, interaction) => {
        function roundDecimals(num, digits) {
            return +(Math.round(num + "e+" + digits) + "e-" + digits);
        }
        try {
            // Get the value from the interaction
            const percentage = interaction.options.getNumber('percentage');

            // Check if percentage is a valid number
            if (isNaN(percentage) && !percentage.includes('%')) {
                return await interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Applying Interest Failed')
                            .setDescription(`The percentage you entered is not a valid number/percentage. EX: 1.5% would be 1.5`)
                            .setColor('Red')
                            .setTimestamp()
                            .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            }

            // Add an "are you sure" embed with a button to confirm
            const buttonRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirmInterest_button')
                        .setLabel('Confirm')
                        .setEmoji('1059331958204801065')
                        .setStyle('Success'),
                    new ButtonBuilder()
                        .setCustomId('cancelInterest_button')
                        .setLabel('Cancel')
                        .setEmoji('1059331996305866823')
                        .setStyle('Danger')
                );

            // Get users from database with "user_type" as "customer"
            const users = await client.query(`SELECT * FROM users WHERE user_type = 'customer' AND name = '${interaction.user.id}'`);
            // Get the total amount of money from the "users" variable in "transactions" table
            let totalMoney = (await client.query(`SELECT SUM(amount) FROM transactions WHERE dr_cr = 'cr' AND user_id IN (${users.map(user => user.id).join(',')})`))[0]['SUM(amount)'] - (await client.query(`SELECT SUM(amount) FROM transactions WHERE dr_cr = 'dr' AND user_id IN (${users.map(user => user.id).join(',')})`))[0]['SUM(amount)'];
            totalMoney = roundDecimals(totalMoney, 2);

            const interestEmbed = new EmbedBuilder()
                .setTitle('Applying Interest')
                .setDescription(`Are you sure you want to apply **${percentage}%** interest to **${Object.keys(users).length}** accounts?` +
                    `\n Estimated balance of **${Object.keys(users).length}** accounts: **$${totalMoney}**` +
                    `\nEstimated interest applied: **$${roundDecimals(totalMoney * (percentage / 100), 2)}**`
                )
                .setColor('#2F3136')
                .setTimestamp()
                .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() });

             await interaction.reply({
                embeds: [interestEmbed],
                components: [buttonRow]
            });

            return module.exports = { interestEmbed, buttonRow, users, totalMoney, percentage };
        } catch (err) {
            console.log(err);
            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Applying Interest Failed')
                        .setDescription(`An error occurred while attempting to calculate interest. If this error persists, please contact a staff member by opening a ticket.`)
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }
    }
};

const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { Decimal } = require('decimal.js');

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
        // Defer the reply so the bot doesn't time out
        await interaction.deferReply();

        try {
            // Get the value from the interaction
            const percentage = new Decimal(`${interaction.options.getNumber('percentage')}`);

            // Check if percentage is a valid number
            if (isNaN(percentage) && !percentage.includes('%')) {
                return await interaction.editReply({
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
            const users = await client.query(`SELECT * FROM users WHERE user_type = 'customer' AND branch_id = '1'`);
            // Get the total amount of money from the "users" variable in "transactions" table
            const totalMoney = (Decimal.sub(new Decimal(`${(await client.query(`SELECT SUM(amount) FROM transactions WHERE dr_cr = 'cr' AND user_id IN (${users.map(user => user.id).join(',')})`))[0]['SUM(amount)']}`), new Decimal(`${(await client.query(`SELECT SUM(amount) FROM transactions WHERE dr_cr = 'dr' AND user_id IN (${users.map(user => user.id).join(',')})`))[0]['SUM(amount)']}`))).toDecimalPlaces(2);

            const interestEmbed = new EmbedBuilder()
                .setTitle('Applying Interest')
                .setDescription(`Are you sure you want to apply **${percentage}%** interest to **${Object.keys(users).length}** accounts?` +
                    `\n Estimated balance of **${Object.keys(users).length}** accounts: **$${totalMoney}**` +
                    `\nEstimated interest applied: **$${(Decimal.mul(Decimal.div(totalMoney, 100), percentage)).toDecimalPlaces(2)}**`
                )
                .setColor('#2F3136')
                .setTimestamp()
                .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() });

             await interaction.editReply({
                embeds: [interestEmbed],
                components: [buttonRow]
            });

            return module.exports = { interestEmbed, buttonRow, users, percentage };
        } catch (err) {
            console.log(err);
            return await interaction.editReply({
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

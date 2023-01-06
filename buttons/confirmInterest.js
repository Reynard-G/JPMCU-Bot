const { EmbedBuilder } = require('discord.js');
const { Decimal } = require('decimal.js');

module.exports = {
    id: 'confirmInterest_button',
    permissions: [],
    run: async (client, interaction) => {

        const { interestEmbed, buttonRow, users, percentage } = require('../slashCommands/admin/interest.js');
        let totalInterest = 0;

        try {
            // Defer the update to the button
            await interaction.deferUpdate();
            // Apply interest to all users
            for (const i of Object.keys(users)) {
                // Get all user IDs
                const id = users[i].id;
                // Select user balance from "transactions" database
                const balance = (Decimal.sub(new Decimal(`${(await client.query(`SELECT SUM(amount) FROM transactions WHERE user_id = '${id}' AND dr_cr = 'cr';`))[0]['SUM(amount)']}`), new Decimal(`${(await client.query(`SELECT SUM(amount) FROM transactions WHERE user_id = '${id}' AND dr_cr = 'dr';`))[0]['SUM(amount)']}`))).toDecimalPlaces(2);
                // Calculate interest
                const interest = (Decimal.mul(Decimal.div(balance, 100), percentage)).toDecimalPlaces(2);
                // Get current date/time
                const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
                // Get current month in name
                const month = new Date().toLocaleString('default', { month: 'long' });
                // Get the max ID from "transactions" database
                const maxID = Decimal.add(new Decimal(`${(await client.query(`SELECT MAX(id) FROM transactions`))[0]['MAX(id)']}`), 1);
                // Add interest to user balance
                totalInterest = (Decimal.add(new Decimal(totalInterest), new Decimal(interest))).toDecimalPlaces(2);
                await client.query(`INSERT INTO transactions (id, user_id, currency_id, amount, fee, dr_cr, type, method, status, note, created_user_id, created_at, updated_at) VALUES ('${maxID}', '${id}', '4', '${interest}', '0.00', 'cr', 'Deposit', 'Manual', '2', '${month} Interest', '${id}', '${date}', '${date}');`);
            }
            // Disable the buttons
            buttonRow.components.forEach(button => button.setDisabled(true));

            // Edit the embed with the new disabled buttons
            await interaction.editReply({
                embeds: [interestEmbed],
                components: [buttonRow]
            });

            // Send a follow-up embed saying the command was canceled
            await interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Applying Interest Successful')
                        .setDescription(
                            `You have successfully applied interest to all accounts.` +
                            `\n\nTotal Interest Paid: **$${totalInterest}**` +
                            `\nTotal Accounts Affected: **${Object.keys(users).length}**`
                        )
                        .setColor('#2F3136')
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        } catch (err) {
            console.log(err);
            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Applying Interest Failed')
                        .setDescription(`There was an error applying interest to all customer accounts. Please try again later.`)
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }
    }
};

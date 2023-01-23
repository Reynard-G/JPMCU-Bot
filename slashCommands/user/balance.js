const { EmbedBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
    name: 'balance',
    description: "Check your JPMCU account balance.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    run: async (client, interaction) => {
        // Defer the reply so the bot doesn't time out
        await interaction.deferReply({ ephemeral: true });

        try {
            // Check if user is registered
            const userExists = (await client.query(`SELECT 1 FROM users WHERE name = '${interaction.user.id}';`));
            if (!((Object.keys(userExists).length > 0) && (userExists[0].hasOwnProperty('1')))) {
                return await interaction.editReply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Registration Failed')
                            .setDescription(`You are not registered with JPMCU. Please register by typing \`/register\`. If you believe this is an error, please contact a staff member by opening a ticket.`)
                            .setColor('Red')
                            .setTimestamp()
                            .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            }

            // Calculate user's balance by using transactions table based on the type of entry (dr or cr)
            const userID = (await client.query(`SELECT id FROM users WHERE name = '${interaction.user.id}';`))[0].id;
            const balance = (await client.query(`SELECT SUM(amount) FROM transactions WHERE user_id = '${userID}' AND dr_cr = 'cr';`))[0]['SUM(amount)'] - (await client.query(`SELECT SUM(amount) FROM transactions WHERE user_id = '${userID}' AND dr_cr = 'dr';`))[0]['SUM(amount)'];

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: `Balance Check`, iconURL: `https://raw.githubusercontent.com/Reynard-G/JPMCU-Bot/master/assets/balance.gif` })
                        .setDescription(`Your current balance is **$${balance}**.`)
                        .setColor('#2F3136')
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        } catch (err) {
            console.log(err);
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Balance Check Failed')
                        .setDescription(`An error occurred while trying to get your balance. If this error persists, please contact a staff member by opening a ticket.`)
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }
    }
};

const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    name: 'register',
    description: "Register an account with JPMCU.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    run: async (client, interaction) => {
        // Defer the reply so the bot doesn't time out
        await interaction.deferReply({ ephemeral: true });

        try {
            // Check if user is already registered
            const userExists = (await client.query(`SELECT 1 FROM users WHERE name = '${interaction.user.id}';`));
            if ((Object.keys(userExists).length > 0) && (userExists[0].hasOwnProperty('1'))) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Registration Failed')
                            .setDescription(`You are already registered with JPMCU. If you believe this is an error, please contact a staff member by opening a ticket.`)
                            .setColor('Red')
                            .setTimestamp()
                            .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            }

            const contractEmbed = new EmbedBuilder()
                .setTitle('JPMCU Account Registration')
                .setDescription(`Hello! We have a standard membership contract for you to look over, if you have any questions at all please ask. If you're ready, please agree to the following contract by clicking the \`I Agree\` button below.` +
                    '\n\nhttps://docs.google.com/document/d/1V5ucuAc_41dCgEIeNsMfWUUtdP6rwk4u6bG7iTpys5w/edit?usp=sharing' +
                    '\n\n***Note:** We have a $350 registration fee and a minimum balance of $500 is needed to keep an account active*'
                    )
                .setColor('#2F3136')
                .setFooter({ text: 'JPMCU', iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            const buttonRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('agreeContract_button')
                        .setLabel('I Agree')
                        .setEmoji('1059331958204801065')
                        .setStyle('Success'),
                    new ButtonBuilder()
                        .setCustomId('disagreeContract_button')
                        .setLabel('I Disagree')
                        .setEmoji('1059331996305866823')
                        .setStyle('Danger')
                );

            await interaction.editReply({
                embeds: [contractEmbed],
                components: [buttonRow]
            });
            return module.exports = { contractEmbed, buttonRow };
        } catch (err) {
            console.log(err);
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Registration Failed')
                        .setDescription(`An error occurred while attempting to check an existing member status. If this error persists, please contact a staff member by opening a ticket.`)
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }
    }
};

const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    name: 'register',
    description: "Register an account with JPMCU.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    run: async (client, interaction) => {
        try {
            // Check if user is already registered
            const userExists = (await client.query(`SELECT 1 FROM users WHERE name = '${interaction.user.id}';`));
            if ((Object.keys(userExists).length > 0) && (userExists[0].hasOwnProperty('1'))) {
                return await interaction.reply({
                    ephemeral: true,
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

            const agreeButton = new ButtonBuilder()
                .setCustomId('agreeContract_button')
                .setLabel('I Agree')
                .setStyle('Success');

            const disagreeButton = new ButtonBuilder()
                .setCustomId('disagreeContract_button')
                .setLabel('I Disagree')
                .setStyle('Danger');

            const buttonRow = new ActionRowBuilder()
                .addComponents(agreeButton, disagreeButton);

            await interaction.reply({ embeds: [contractEmbed], components: [buttonRow], ephemeral: true });
            return module.exports = { contractEmbed, buttonRow };

        } catch (err) {
            console.log(err);
            return await interaction.reply({
                ephemeral: true,
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

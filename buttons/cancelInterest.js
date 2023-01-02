const { EmbedBuilder } = require('discord.js');

module.exports = {
    id: 'cancelInterest_button',
    permissions: [],
    run: async (client, interaction) => {
        let { interestEmbed, buttonRow } = require('../slashCommands/admin/interest.js');

        // Disable the buttons
        buttonRow.components.forEach(button => button.setDisabled(true));

        // Edit the embed with the new disabled buttons
        await interaction.update({
            ephemeral: true,
            embeds: [interestEmbed],
            components: [buttonRow]
        });

        // Send a follow-up embed saying the command was canceled
        return await interaction.followUp({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle('Applying Interest Canceled')
                    .setDescription(`You have canceled the command \`/interest\`. Please re-run the command if you wish to apply interest to all customer accounts.`)
                    .setColor('Red')
                    .setTimestamp()
                    .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
            ]
        });
    }
};

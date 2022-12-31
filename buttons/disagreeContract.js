const { EmbedBuilder } = require('discord.js');

module.exports = {
    id: 'disagreeContract_button',
    permissions: [],
    run: async (client, interaction) => {
        const { contractEmbed, buttonRow } = require('../slashCommands/user/register.js');

        const disagreeEmbed = new EmbedBuilder()
            .setTitle('JPMCU Account Registration')
            .setDescription('You have declined the terms and conditions. If you have any questions regarding our Member Contract, please contact a staff member by opening a ticket.')
            .setColor('#2F3136')
            .setFooter({ text: 'JPMCU', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        // Disable both buttons
        buttonRow.components.forEach((button) => {
            button.setDisabled(true);
        });

        await interaction.update({ embeds: [contractEmbed], components: [buttonRow] });
        return await interaction.followUp({ ephemeral: true, embeds: [disagreeEmbed] });
    }
};

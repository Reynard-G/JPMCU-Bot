const { ActionRowBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    id: "disagreeContract_button",
    permissions: [],
    run: async (client, interaction) => {
        try {
            const disagreeEmbed = new EmbedBuilder()
                .setTitle("JPMCU Account Registration")
                .setDescription("You have declined the terms and conditions. If you have any questions regarding our Member Contract, please contact a staff member by opening a ticket.")
                .setColor("#2F3136")
                .setFooter({ text: "JPMCU", iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            // Disable both buttons
            const buttonRow = ActionRowBuilder.from(interaction.message.components[0])
            buttonRow.components.forEach(button => button.setDisabled(true));

            await interaction.update({ components: [buttonRow] });
            return await interaction.followUp({ ephemeral: true, embeds: [disagreeEmbed] });
        } catch (err) {
            console.log(err);
            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Registration Failed")
                        .setDescription(`It looks like the bot has lost data between you executing \`/register\` and clicking the button. If this error persists, please contact a staff member by opening a ticket.`)
                        .setColor("Red")
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }
    }
};

const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

module.exports = {
    id: "agreeContract_button",
    permissions: [],
    run: async (client, interaction) => {
        const { contractEmbed, buttonRow } = require("../slashCommands/user/register.js");

        const credentialsModal = new ModalBuilder()
            .setTitle("Register")
            .setCustomId("agreeContract_modal");

        const ignInput = new TextInputBuilder()
            .setCustomId("ignInput")
            .setPlaceholder("Enter your In-Game Name here")
            .setStyle(TextInputStyle.Short)
            .setLabel("In-Game Name")
            .setMinLength(3)
            .setMaxLength(16)
            .setRequired(true);

        const passwordInput = new TextInputBuilder()
            .setCustomId("passwordInput")
            .setPlaceholder("Enter a 4-6 digit PIN here")
            .setStyle(TextInputStyle.Short)
            .setLabel("Account Password")
            .setMinLength(4)
            .setMaxLength(6)
            .setRequired(true);

        const ignRow = new ActionRowBuilder()
            .addComponents(ignInput);

        const passwordRow = new ActionRowBuilder()
            .addComponents(passwordInput);

        credentialsModal.addComponents(ignRow, passwordRow);
        await interaction.showModal(credentialsModal);

        // Disable both buttons
        buttonRow.components.forEach((button) => {
            button.setDisabled(true);
        });

        return await interaction.editReply({ embeds: [contractEmbed], components: [buttonRow] });
    }
};

const { EmbedBuilder, ApplicationCommandType } = require("discord.js");
const { userExists } = require("../../utils/checkUser");
const { getBalance } = require("../../utils/userBalance");

module.exports = {
    name: "balance",
    description: "Check your JPMCU account balance.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    run: async (client, interaction) => {
        // Defer the reply so the bot doesn't time out
        await interaction.deferReply({ ephemeral: true });

        try {
            // Check if user is registered
            if (!(await userExists(client, interaction, interaction.user.id, true))) return;

            // Calculate user's balance by using transactions table based on the type of entry (dr or cr)
            const balance = await getBalance(client, interaction.user.id);

            return await interaction.editReply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: `Balance Check`, iconURL: `https://raw.githubusercontent.com/Reynard-G/JPMCU-Bot/master/assets/balance.gif` })
                        .setDescription(`Your current balance is **$${balance}**.`)
                        .setColor("#2F3136")
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        } catch (err) {
            console.log(err);
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Balance Check Failed")
                        .setDescription(`An error occurred while trying to get your balance. If this error persists, please contact a staff member by opening a ticket.`)
                        .setColor("Red")
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }
    }
};

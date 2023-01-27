const { EmbedBuilder } = require("discord.js");

exports.userExists = async function (client, interaction, discordUserID, deferred, desiredReturn = false) {
    const userExists = (await client.query(`SELECT 1 FROM users WHERE name = "${discordUserID}";`));
    if (!((Object.keys(userExists).length > 0) && (userExists[0].hasOwnProperty("1")))) {
        if (deferred && !desiredReturn) {
            await interaction.editReply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Registration Failed")
                        .setDescription(`You are not registered with JPMCU. Please register by typing \`/register\`. If you believe this is an error, please contact a staff member by opening a ticket.`)
                        .setColor("Red")
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        } else if (!desiredReturn) {
            await interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Registration Failed")
                        .setDescription(`You are not registered with JPMCU. Please register by typing \`/register\`. If you believe this is an error, please contact a staff member by opening a ticket.`)
                        .setColor("Red")
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }
        return !desiredReturn ? false : true;
    }
    return !desiredReturn ? true : false;
};
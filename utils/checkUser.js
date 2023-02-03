const { EmbedBuilder } = require("discord.js");

exports.exists = async function (client, interaction, discordUserID, deferred, desiredReturn = false) {
    const userExists = (await client.query(`SELECT 1 FROM users WHERE name = "${discordUserID}";`));
    if (!((Object.keys(userExists).length > 0) && (userExists[0].hasOwnProperty("1")))) {
        const embed = new EmbedBuilder()
            .setTitle("Registration Failed")
            .setDescription(`You are not registered with JPMCU. Please register by typing \`/register\`. If you believe this is an error, please contact a staff member by opening a ticket.`)
            .setColor("Red")
            .setTimestamp()
            .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() });

        if (deferred && !desiredReturn) {
            await interaction.editReply({ ephemeral: true, embeds: [embed] });
        } else if (!desiredReturn) {
            await interaction.reply({ ephemeral: true, embeds: [embed] });
        }
        return !desiredReturn ? false : true;
    }
    return !desiredReturn ? true : false;
};

exports.id = async function (client, userID) {
    const id = (await client.query(`SELECT id FROM users WHERE name = "${userID}";`))[0].id;
    return id;
};

exports.balance = async function (client, discordUserID) {
    const balance = (await client.query(`SELECT SUM(CASE WHEN dr_cr = "cr" THEN amount ELSE -amount END) FROM transactions WHERE user_id = (SELECT id FROM users WHERE name = "${discordUserID}")`))[0]["SUM(CASE WHEN dr_cr = \"cr\" THEN amount ELSE -amount END)"];
    return balance;
};

exports.hasRole = async function (interaction, discordUserID, roleID) {
    return interaction.guild.members.cache.get(discordUserID).roles.cache.has(roleID) ? true : false;
};
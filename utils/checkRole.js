exports.userHasRole = async function (interaction, discordUserID, roleID) {
    return interaction.guild.members.cache.get(discordUserID).roles.cache.has(roleID) ? true : false;
}
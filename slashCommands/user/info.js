const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    name: 'info',
    description: "Information about JPMCU.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    run: async (client, interaction) => {
        // Create an embed with information about JPMCU
        require('dotenv').config()
        const embed = new EmbedBuilder()
            .setTitle('<:info:1062551047073173596> JPMCU Information <:info:1062551047073173596>')
            .setDescription(
                `Made by **<@399708215534944267>**` +
                `\n**Website**: https://dcjpm.com/` +
                `\n**Discord**: https://discord.gg/dCWDHkFczw` +
                `\n\n __**Note**__: <@${process.env.CLIENT_ID}> or Staff will never ask for your account credentials, official messages will come from **${client.user.tag}** or from the official JPMCU Discord Server.`
                )
            .setColor('#2F3136')
            .setTimestamp()
            .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() });

        // Create an action row with a button to the website
        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Go to the JPMCU Website')
                    .setStyle('Link')
                    .setURL('https://dcjpm.com/')
            );

        // Send the embed and action row
        await interaction.reply({
            embeds: [embed],
            components: [actionRow]
        });
    }
};

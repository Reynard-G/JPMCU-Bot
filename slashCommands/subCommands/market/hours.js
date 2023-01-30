const { EmbedBuilder } = require("discord.js");
const moment = require("moment");

module.exports = {
    name: "hours",
    description: "Check if the market is open or closed.",
    run: async (client, interaction) => {
        const clock = await client.alpaca.getClock();
        const status = clock.is_open ? "open" : "closed";
        const nextStatus = clock.is_open ? "closed" : "opened";
        const nextStatusTime = clock.is_open ? moment(clock.next_close).unix() : moment(clock.next_open).unix();

        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: `Market Hours`, iconURL: `https://raw.githubusercontent.com/Reynard-G/JPMCU-Bot/master/assets/markethours.gif`, })
                    .addFields(
                        { name: "Market Status", value: `The market is currently ${status}.`, inline: true, },
                        { name: "Next Market Status", value: `The market will be ${nextStatus} at <t:${nextStatusTime}:f>.`, inline: true, }
                    )
                    .setColor("2F3136")
                    .setTimestamp()
                    .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() }),
            ],
        });
    },
};

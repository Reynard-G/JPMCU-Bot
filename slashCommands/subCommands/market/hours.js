const { EmbedBuilder } = require("discord.js");
const moment = require("moment");

module.exports = {
    name: "hours",
    description: "Check if the market is open or closed.",
    run: async (client, interaction) => {
        const clock = await client.alpaca.getClock();
        const currentDate = new Date();
        const status = moment(currentDate).isAfter(clock.next_open) && moment(currentDate).isBefore(clock.next_close) ? "open" : "closed";
        const nextStatus = moment(currentDate).isAfter(clock.next_open) && moment(currentDate).isBefore(clock.next_close) ? "closed" : "open";
        const nextStatusTime = moment(currentDate).isAfter(clock.next_open) && moment(currentDate).isBefore(clock.next_close) ? moment(clock.next_close).unix() : moment(clock.next_open).unix();

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

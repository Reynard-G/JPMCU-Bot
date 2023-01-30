const { EmbedBuilder, AttachmentBuilder } = require("discord.js");

module.exports = {
    name: "chartinfo",
    run: async (client, interaction) => {
        const image = new AttachmentBuilder(`assets/chartinfo.png`);
        return interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: `Chart Info`, iconURL: `https://raw.githubusercontent.com/Reynard-G/JPMCU-Bot/master/assets/marketinfo.gif` })
                    .setDescription(
                        `A candlestick chart is a style of financial chart used to describe price movements of a security, derivative, or currency. Each "candle" typically shows one day, thus a one-month chart may show the 20 trading days as 20 "candles".` +
                        `\n\nIn our case, each "candle" represents 1 week of trading thus a 1 year chart will show 52 "candles".`
                    )
                    .setImage(`attachment://chartinfo.png`)
                    .setColor("2F3136")
                    .setTimestamp()
                    .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
            ],
            files: [
                image
            ]
        });
    }
};

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    name: "tickers",
    description: "A list of available tickers for the market commands.",
    run: async (client, interaction) => {
        // Defer the reply so the bot doesn't time out
        await interaction.deferReply({ ephemeral: true });

        // Create a list of tickers along with their company names
        const tickers = Object.keys(client.stockTickers).concat(Object.keys(client.cryptoTickers));
        const companies = Object.values(client.stockTickers).concat(Object.values(client.cryptoTickers));

        // Create a list of embeds to send with pages of 10 tickers each
        const embeds = [];
        let page = 1;
        let embed = new EmbedBuilder()
            .setAuthor({ name: `Available Tickers`, iconURL: `https://raw.githubusercontent.com/Reynard-G/JPMCU-Bot/master/assets/tickers.gif` })
            .setDescription(`You are able to switch pages using the buttons below for **5 minutes** after executing this command.`)
            .setColor("#2F3136")
            .setTimestamp()
            .setFooter({ text: `JPMCU | Page ${page}/${Math.ceil(tickers.length / 10)}`, iconURL: interaction.guild.iconURL() });

        for (let i = 0; i < tickers.length; i++) {
            if (i % 10 === 0 && i !== 0) {
                page++;
                embeds.push(embed);
                embed = new EmbedBuilder()
                    .setAuthor({ name: `Available Tickers`, iconURL: `https://raw.githubusercontent.com/Reynard-G/JPMCU-Bot/master/assets/tickers.gif` })
                    .setDescription(`You are able to switch pages of the tickers list for **5 minutes** since this message was sent.`)
                    .setColor("#2F3136")
                    .setTimestamp()
                    .setFooter({ text: `JPMCU | Page ${page}/${Math.ceil(tickers.length / 10)}`, iconURL: interaction.guild.iconURL() });
            }

            embed.addFields(
                { name: tickers[i], value: companies[i] }
            );
        }
        embeds.push(embed);

        // Create the buttons
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("previous")
                    .setLabel("Previous")
                    .setEmoji("⬅️")
                    .setStyle("Primary")
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("Next")
                    .setEmoji("➡️")
                    .setStyle("Primary")
                    .setDisabled(embeds.length === 1)
            );

        // Send the embeds
        const msg = await interaction.editReply({
            embeds: [embeds[0]],
            components: [buttons]
        });

        // Create a collector for the buttons
        const filter = (button) => button.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 300000 });

        // Handle the buttons
        page = 0;
        collector.on("collect", async (button) => {
            if (button.customId === "previous") {
                page--;
                buttons.components[0].setDisabled(page === 0);
                buttons.components[1].setDisabled(false);
                await button.update({
                    embeds: [embeds[page]],
                    components: [buttons]
                });
            } else {
                page++;
                buttons.components[0].setDisabled(false);
                buttons.components[1].setDisabled(page === (embeds.length - 1));
                await button.update({
                    embeds: [embeds[page]],
                    components: [buttons]
                });

            }
        });

        collector.on("end", async () => {
            buttons.components[0].setDisabled(true);
            buttons.components[1].setDisabled(true);
            return await interaction.editReply({
                embeds: [embeds[page]],
                components: [buttons]
            });
        });
    }
};

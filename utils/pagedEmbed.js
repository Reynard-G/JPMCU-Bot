exports.pageEmbed = async (interaction, pages, buttons, timeout = 1000) => { //300000
    if (!interaction || !pages || !buttons || timeout < 0) throw new Error("Invalid arguments provided.");

    if (pages.length === 1) {
        return interaction.editReply({ embeds: [pages[0]] });
    }

    let page = 0;
    const msg = await interaction.editReply({ embeds: [pages[0]], components: [buttons] });

    const filter = (i) => i.customId === "previous" || i.customId === "next" && i.user.id === interaction.user.id;
    const collector = msg.createMessageComponentCollector({ filter, time: timeout });

    // Update page on button click
    collector.on("collect", async (i) => {
        if (i.customId === "previous") {
            page = page > 0 ? --page : pages.length - 1;
        } else if (i.customId === "next") {
            page = page + 1 < pages.length ? ++page : 0;
        }

        // Update footer text
        pages[page].setFooter({ text: `JPMCU • Page ${page + 1} of ${pages.length}`, iconURL: interaction.guild.iconURL() });

        // Update buttons
        buttons.components[0].setDisabled(page === 0);
        buttons.components[1].setDisabled(page === pages.length - 1);

        await i.update({ embeds: [pages[page]], components: [buttons] });
    });

    // Disable buttons after timeout
    collector.on("end", () => {
        buttons.components.forEach(button => button.setDisabled(true));
        interaction.editReply({ components: [buttons] });
    });
};
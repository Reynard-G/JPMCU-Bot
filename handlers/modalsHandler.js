const fs = require("fs");
const chalk = require("chalk");
const AsciiTable = require("ascii-table");
const table = new AsciiTable();
table.setHeading("Modals", "Stats").setBorder("|", "=", "0", "0");

module.exports = (client) => {
    fs.readdirSync("./modals/").filter((file) => file.endsWith(".js")).forEach((file) => {
        const modal = require(`../modals/${file}`);
        client.modals.set(modal.id, modal);
        table.addRow(modal.id, "✅");
    });
    console.log(chalk.magenta(table.toString()));
};
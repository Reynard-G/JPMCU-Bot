const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
    name: "membership",
    description: "Apply for JPMCU membership. Requires at least $850 in your account.",
    type: ApplicationCommandType.ChatInput,
    cooldown: 3000,
    options: [
        {
            name: "waiver",
            description: "Staff members only, waive the registration fee of $350.",
            required: false,
            type: ApplicationCommandOptionType.User
        }
    ],
    run: async (client, interaction) => {
        // Defer the reply so the bot doesn't time out
        await interaction.deferReply({ ephemeral: true });
        const user = interaction.options.getUser("waiver");
        let userID = user !== null ? user.id : interaction.user.id;

        // Check if the user's roles is any of the allowed roles
        const allowedRoles = {
            "Owner": "962086358376149053",
            "Chairman": "962086358376149052",
            "Technology Officer": "1008425940898041958",
            "Credit Officer": "1055675065636761660",
            "Teller": "962086358363537429"
        };
        const userRoles = interaction.member.roles.cache.map(role => `${role.id}`);
        const allowed = Object.values(allowedRoles).some(role => userRoles.includes(role));
        if ((!allowed) && (user !== null)) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Membership Application Failed")
                        .setDescription(`You do not have permission to waive the registration fee. If you believe this is an error, please contact a staff member.`)
                        .setColor("Red")
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }

        // Check if user is not registered
        const userExists = (await client.query(`SELECT 1 FROM users WHERE name = "${userID}";`));
        if ((Object.keys(userExists).length === 0) || (!userExists[0].hasOwnProperty("1"))) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Registration Failed")
                        .setDescription(`You are not registered with JPMCU. Please register with the \`/register\` command.`)
                        .setColor("Red")
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }

        // Check if user already has the membership role
        require("dotenv").config();
        const roleID = process.env.MEMBER_ROLE_ID;
        if (interaction.guild.members.cache.get(userID).roles.cache.has(roleID)) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Membership Application Failed")
                        .setDescription(`It appears <@${userID}> is already a member of JPMCU due to having the <@&${roleID}> role. If you believe this is an error, please contact a staff member by opening a ticket.`)
                        .setColor("Red")
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }

        try {
            // Get the user's ID
            if (user === null) {
                // Check if user has enough money
                const bankID = (await client.query(`SELECT id FROM users WHERE name = "${userID}";`))[0].id;
                const balance = (await client.query(`SELECT SUM(amount) FROM transactions WHERE user_id = "${bankID}" AND dr_cr = "cr";`))[0]["SUM(amount)"] - (await client.query(`SELECT SUM(amount) FROM transactions WHERE user_id = "${bankID}" AND dr_cr = "dr";`))[0]["SUM(amount)"];

                if (balance < 850) {
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Membership Application Failed")
                                .setDescription(`You do not have enough money in your account to apply for membership. You need at least **$850** in your account to apply for membership. If you are unable to meet this requirement, please contact a staff member for a waiver.`)
                                .setFields(
                                    {
                                        name: "Balance",
                                        value: `You current have **$${balance}** in your account`,
                                        inline: true
                                    },
                                    {
                                        name: "Fees",
                                        value: `Registration Fee: **$350**` +
                                            `\nMinimum Balance: **$500**`,
                                        inline: true
                                    }
                                )
                                .setColor("Red")
                                .setTimestamp()
                                .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                        ]
                    });
                }

                // Deduct the registration fee
                const registrationFee = 350;
                await client.query(`INSERT INTO transactions (user_id, currency_id, amount, fee, dr_cr, type, method, status, note, created_at, updated_at) VALUES ("${bankID}", 4, ${registrationFee}, 0.00, "dr", "Withdraw", "Manual", 2, "Registration Fee through JPMCU Bot", NOW(), NOW());`);

                // Give the user the membership role
                await interaction.guild.members.cache.get(userID).roles.add(roleID);
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Membership Application Successful")
                            .setDescription(`You have successfully applied for membership. You have been given the <@&${roleID}> role.`)
                            .setColor("Green")
                            .setTimestamp()
                            .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            } else {
                // Give the user the membership role
                await interaction.guild.members.cache.get(userID).roles.add(roleID);
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Membership Application Successful")
                            .setDescription(`<@${userID}> has successfully been applied for membership. They have been given the <@&${roleID}> role.`)
                            .setColor("Green")
                            .setTimestamp()
                            .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            }
        } catch (err) {
            console.log(err);
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Membership Application Failed")
                        .setDescription(`An error occurred while processing your membership application. Please try again later.`)
                        .setColor("Red")
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }
    }
};

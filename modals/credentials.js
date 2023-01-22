const { EmbedBuilder } = require('discord.js');
const bcrypt = require('bcryptjs');

module.exports = {
    id: 'agreeContract_modal',
    permissions: [],
    run: async (client, interaction) => {
        // Defer the reply so the bot doesn't time out
        await interaction.deferReply({ ephemeral: true });

        try {
            // Check if user is already registered
            const userExists = (await client.query(`SELECT 1 FROM users WHERE name = '${interaction.user.id}';`));
            if ((Object.keys(userExists).length > 0) && (userExists[0].hasOwnProperty('1'))) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Registration Failed')
                            .setDescription(`You are already registered with JPMCU. If you believe this is an error, please contact a staff member by opening a ticket.`)
                            .setColor('Red')
                            .setTimestamp()
                            .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            }

            // Check if password is valid
            const password = interaction.fields.getTextInputValue('passwordInput');
            if (isNaN(password)) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Registration Failed')
                            .setDescription(`The password you entered is invalid. EX: 1234 or 654321.`)
                            .setColor('Red')
                            .setTimestamp()
                            .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            }

            // Assign user details
            const id = parseInt((((await client.query(`SELECT MAX(id) FROM users;`))[0]['MAX(id)']).toString()).replace('n', '')) + 1;
            const accountNumber = parseInt((((await client.query(`SELECT MAX(account_number) FROM users;`))[0]['MAX(account_number)']).toString()).replace('n', '')) + 1;
            await client.query(`INSERT INTO users (id, name, email, account_number, user_type, branch_id, status, profile_picture, password, created_at, updated_at, allow_withdrawal) VALUES (${id}, '${interaction.user.id}', '${interaction.fields.getTextInputValue('ignInput')}', ${accountNumber}, 'customer', '1', '1', '', '${bcrypt.hashSync(password, 10)}', NOW(), NOW(), '1');`);

            // Send the user their account credentials
            // Handle the error when the user has DMs disabled
            try {
                await interaction.user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Account Credentials')
                            .setDescription(`Your account credentials are as follows:` +
                                `\n` +
                                `\n**Username:** ${interaction.fields.getTextInputValue('ignInput')}` +
                                `\n**Password:** ${interaction.fields.getTextInputValue('passwordInput')}` +
                                `\n\n You can login to your account at https://dcjpm.com/.`
                            )
                            .setColor('#2F3136')
                            .setTimestamp()
                            .setFooter({ text: `JPMCU`, iconURL: interaction.user.avatarURL() })
                    ]
                });

                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Registration Successful')
                            .setDescription(`Your account credentials have been sent to your DMS. Please keep those credentials safe as they are the only way to access your account through the website.`)
                            .setColor('Green')
                            .setTimestamp()
                            .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            } catch (error) {
                console.log(error);
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Registration Successful')
                            .setDescription(
                                `There has been an error sending your credentials to your DMS, therefore you will receive your account credentials in this channel. Please keep these credentials safe as this is not a normal message and will delete itself once Discord is restarted.` +
                                `\n\nYour account credentials are as follows:` +
                                `\n**Username:** ${interaction.fields.getTextInputValue('ignInput')}` +
                                `\n**Password:** ${interaction.fields.getTextInputValue('passwordInput')}` +
                                `\n\n You can login to your account at https://dcjpm.com/.`
                            )
                            .setColor('Green')
                            .setTimestamp()
                            .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                    ]
                });
            }
        } catch (error) {
            console.log(error);
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Registration Failed')
                        .setDescription(`An error occurred while trying to register your account. If this error persists, please contact a staff member by opening a ticket.`)
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.guild.iconURL() })
                ]
            });
        }
    }
};
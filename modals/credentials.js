const { EmbedBuilder } = require('discord.js');
const bcrypt = require('bcryptjs');

module.exports = {
    id: 'agreeContract_modal',
    permissions: [],
    run: async (client, interaction) => {
        try {
            // Check if user is already registered
            const userExists = (await client.query(`SELECT 1 FROM users WHERE name = '${interaction.user.id}';`));
            if ((Object.keys(userExists).length > 0) && (userExists[0].hasOwnProperty('1'))) {
                return await interaction.reply({
                    ephemeral: true,
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
                return await interaction.reply({
                    ephemeral: true,
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
            const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const newUser = {
                id: id,
                name: interaction.user.id,
                email: interaction.fields.getTextInputValue('ignInput'),
                phone: null,
                account_number: accountNumber,
                user_type: 'customer',
                role_id: null,
                branch_id: 1,
                status: 1,
                profile_picture: '',
                email_verified_at: null,
                sms_verified_at: null,
                password: bcrypt.hashSync(password, 10),
                provider: null,
                provider_id: null,
                country_code: null,
                remember_token: null,
                created_at: date,
                updated_at: date,
                two_factor_code: null,
                two_factor_expires_at: null,
                otp: null,
                otp_expires_at: null,
                allow_withdrawal: 1,
                document_verified_at: null,
                document_submitted_at: null
            };
            await client.query(`INSERT INTO users (id, name, email, phone, account_number, user_type, role_id, branch_id, status, profile_picture, email_verified_at, sms_verified_at, password, provider, provider_id, country_code, remember_token, created_at, updated_at, two_factor_code, two_factor_expires_at, otp, otp_expires_at, allow_withdrawal, document_verified_at, document_submitted_at) VALUES (${newUser.id}, '${newUser.name}', '${newUser.email}', ${newUser.phone}, ${newUser.account_number}, '${newUser.user_type}', ${newUser.role_id}, ${newUser.branch_id}, ${newUser.status}, '${newUser.profile_picture}', ${newUser.email_verified_at}, ${newUser.sms_verified_at}, '${newUser.password}', ${newUser.provider}, ${newUser.provider_id}, ${newUser.country_code}, ${newUser.remember_token}, '${newUser.created_at}', '${newUser.updated_at}', ${newUser.two_factor_code}, ${newUser.two_factor_expires_at}, ${newUser.otp}, ${newUser.otp_expires_at}, ${newUser.allow_withdrawal}, ${newUser.document_verified_at}, ${newUser.document_submitted_at});`);

            // Assign the user to the member role
            const memberRole = interaction.guild.roles.cache.get('1025591402102526072');
            await interaction.member.roles.add(memberRole);

            // Send the user their account credentials
            // Handle the error when the user has DMs disabled
            try {
                await interaction.user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Account Credentials')
                            .setDescription(`Your account credentials are as follows:` +
                                `\n` +
                                `\n**Username:** ${newUser.email}` +
                                `\n**Password:** ${interaction.fields.getTextInputValue('passwordInput')}` +
                                `\n\n You can login to your account at https://dcjpm.com/.`
                            )
                            .setColor('#2F3136')
                            .setTimestamp()
                            .setFooter({ text: `JPMCU`, iconURL: interaction.user.avatarURL() })
                    ]
                });
            } catch (error) {
                console.log(error);
                await interaction.reply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Registration Successful')
                            .setDescription(
                                `There has been an error sending your credentials to your DMS, therefore you will receive your account credentials in this channel. Please keep these credentials safe as this is not a normal message and will delete itself once Discord is restarted.` +
                                `\n\nYour account credentials are as follows:` +
                                `\n**Username:** ${newUser.email}` +
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
            return await interaction.reply({
                ephemeral: true,
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
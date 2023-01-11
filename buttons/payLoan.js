const { EmbedBuilder } = require('discord.js');

module.exports = {
    id: 'payLoan_button',
    permissions: [],
    run: async (client, interaction) => {
        // Defer the reply so the bot doesn't time out
        await interaction.deferReply();

        try {
            const userID = (await client.query(`SELECT id FROM users WHERE name = '${interaction.user.id}';`))[0].id;
            const loanID = (await client.query(`SELECT id FROM loans WHERE borrower_id = '${userID}';`))[0].id;
            const repayments = await client.query(`SELECT * FROM loan_repayments WHERE loan_id = '${loanID}';`);

            // Get the next repayment date and convert it to local time
            const tomorrow = new Date();
            var offset = (new Date().getTimezoneOffset() / 60) * -1;
            tomorrow.setHours(tomorrow.getHours() + offset);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowDate = tomorrow.toISOString().slice(0, 10).replace('T', ' ');

            const currentRepayment = repayments.filter(repayment => (repayment.repayment_date).toISOString().slice(0, 10).replace('T', ' ') === tomorrowDate)[0];

            // Deduct loan amount from user's balance in transactions table
            const transactionID = parseInt((((await client.query(`SELECT MAX(id) FROM transactions;`))[0]['MAX(id)']).toString()).replace('n', '')) + 1;
            const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
            await client.query(`INSERT INTO transactions (id, user_id, currency_id, amount, fee, dr_cr, type, method, status, note, loan_id, ref_id, parent_id, other_bank_id, gateway_id, created_user_id, updated_user_id, branch_id, transaction_details, created_at, updated_at) VALUES ('${transactionID}', '${userID}', '1', '${currentRepayment.amount_to_pay}', '0', 'dr', 'Loan_Repayment', 'Online', '2', 'Loan Repayment', null, null, null, null, null, '${userID}', null, '1', null, '${date}', '${date}');`);

            // Log the loan payment in loan_payments table & get the max id from loan_payments table
            const paymentID = parseInt((((await client.query(`SELECT MAX(id) FROM loan_payments;`))[0]['MAX(id)']).toString()).replace('n', '')) + 1;
            await client.query(`INSERT INTO loan_payments (id, loan_id, paid_at, late_penalties, interest, amount_to_pay, remarks, user_id, transaction_id, repayment_id, created_at, updated_at) VALUES ('${paymentID}', '${currentRepayment.loan_id}', '${new Date().toISOString().slice(0, 10).replace('T', ' ')}', '${currentRepayment.penalty}', '${currentRepayment.interest}', '${currentRepayment.amount_to_pay}', 'Through JPMCU Bot', '${userID}', '${transactionID}', '${currentRepayment.id}', '${date}', '${date}');`);

            // Update the status of the repayment in loan_repayments table
            await client.query(`UPDATE loan_repayments SET status = '1' WHERE id = '${currentRepayment.id}';`);

            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Loan Payment Successful')
                        .setDescription(`You have successfully paid your current loan period of **$${currentRepayment.amount_to_pay}**.`)
                        .setColor('Green')
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.user.avatarURL() })
                ]
            });
        } catch (err) {
            console.log(err);
            return await interaction.editReply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Loan Payment Failed')
                        .setDescription(`An error occurred while trying to pay your loan. If this error persists, please contact a staff member by opening a ticket.`)
                        .setColor('Red')
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: interaction.user.avatarURL() })
                ]
            });
        }
    }
};
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const cron = require('node-cron');
const client = require('..');

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function convertPeriodToDays(period) {
    if (period === '+1 day') return 1;
    if (period === '+1 week') return 7;
    if (period === '+1 month') return 30;
    if (period === '+1 year') return 365;
    return 0;
}

function convertDaysToPeriod(days) {
    if (days === 1) return '1 day';
    if (days === 7) return '1 week';
    if (days === 30) return '1 month';
    if (days === 365) return '1 year';
    return '0 days';
}

cron.schedule('59 23 * * *', async () => {
    try {
        const loans = [];
        const loanDetails = await client.query(`SELECT loan_product_id, borrower_id, first_payment_date, applied_amount, total_payable FROM loans;`);
        const loanTerms = await client.query(`SELECT id, term, term_period FROM loan_products;`);
        const usernames = await client.query(`SELECT id, name FROM users;`);
        const loansCount = (await client.query(`SELECT COUNT(*) FROM loans;`))[0]['COUNT(*)'];
        let userID;
        for (let i = 0; i < loansCount; i++) {
            userID = ((await client.query(`SELECT id FROM users WHERE id = '${loanDetails[i].borrower_id}';`))[0]).id;
            loans.push({
                name: usernames.filter(user => user.id === userID)[0].name,
                id: userID,
                first_payment_date: loanDetails.filter(loan => loan.borrower_id === userID)[0].first_payment_date,
                loan_product_id: loanDetails.filter(loan => loan.borrower_id === userID)[0].loan_product_id,
                term: loanTerms.filter(term => term.id === loanDetails[i].loan_product_id)[0].term,
                term_period: loanTerms.filter(term => term.id === loanDetails[i].loan_product_id)[0].term_period,
                loan_amount: loanDetails[i].applied_amount,
                loan_payable: loanDetails[i].total_payable
            });
        }

        let amountDue = 0;
        for (let i = 0; i < loans.length; i++) {
            let periodDate = new Date();
            let paymentDate = loans[i].first_payment_date;
            for (let j = 0; j < loans[i].term; j++) {
                let tomorrow = new Date();
                tomorrow.setDate((new Date()).getDate() + 1);
                periodDate = addDays(periodDate, paymentDate.getDate() + (convertPeriodToDays(loans[i].term_period) * j));
                if (periodDate.getDate() === tomorrow.getDate() && periodDate.getMonth() === tomorrow.getMonth() && periodDate.getFullYear() === tomorrow.getFullYear()) {
                    amountDue = +(Math.round((loans[i].loan_payable / loans[i].term) + "e+2") + "e-2");
                    const user = await client.users.fetch(loans[i].name);
                    const reminderEmbed = new EmbedBuilder()
                        .setTitle('Loan Payment Reminder')
                        .setDescription(`This is a reminder that your loan payment is due tomorrow. Please make sure to pay your loan payment on time to avoid any late fees.`)
                        .addFields(
                            {
                                name: 'Loan Payment',
                                value: `**Loan Amount Due:** $${amountDue}
                                **Current Loan Term:** ${convertDaysToPeriod(convertPeriodToDays(loanTerms[i].term_period) * j)}`,
                                inline: true
                            },
                            {
                                name: 'Loan Details',
                                value: `**Loan Amount:** $${loans[i].loan_amount}
                                **Loan Payable:** $${loans[i].loan_payable}
                                **Loan Term:** ${loans[i].term}
                                **Loan Term Period:** ${loans[i].term_period}`,
                                inline: true
                            }
                        )
                        .setColor('#2F3136')
                        .setTimestamp()
                        .setFooter({ text: `JPMCU`, iconURL: client.user.avatarURL() });

                    // Check if the user has enough money to pay the loan payment
                    const userID = (await client.query(`SELECT id FROM users WHERE name = '${loans[i].name}';`))[0].id;
                    const userBalance = (await client.query(`SELECT SUM(amount) FROM transactions WHERE user_id = '${userID}' AND dr_cr = 'cr';`))[0]['SUM(amount)'] - (await client.query(`SELECT SUM(amount) FROM transactions WHERE user_id = '${userID}' AND dr_cr = 'dr';`))[0]['SUM(amount)'];
                    if (userBalance >= amountDue) {
                        // Create a button to pay the loan payment
                        const payLoanButton = new ButtonBuilder()
                            .setCustomId('payLoan_button')
                            .setLabel('Pay Loan')
                            .setStyle('Success');

                        const buttonRow = new ActionRowBuilder()
                            .addComponents(payLoanButton);

                        await user.send({ embeds: [reminderEmbed], components: [buttonRow] });
                    } else {
                        await user.send({ embeds: [reminderEmbed] });
                    }
                } else {
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
});

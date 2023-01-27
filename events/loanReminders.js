const { EmbedBuilder } = require("discord.js");
const Cron = require("croner");
const client = require("..");

function convertPeriodToDays(period) {
    if (period === "+1 day") return 1;
    if (period === "+1 week") return 7;
    if (period === "+1 month") return 30;
    if (period === "+1 year") return 365;
    return 0;
}

function convertDaysToPeriod(days) {
    if (days === 1) return "1 day";
    if (days === 7) return "1 week";
    if (days === 30) return "1 month";
    if (days === 365) return "1 year";
    return "0 days";
}

Cron("59 23 * * *", async () => {
    try {
        const loans = [];
        const loanDetails = await client.query(`SELECT id, loan_product_id, borrower_id, first_payment_date, applied_amount, total_payable, total_paid FROM loans WHERE status = 1;`);
        const loanTerms = await client.query(`SELECT id, term, term_period FROM loan_products;`);
        const usernames = await client.query(`SELECT id, name FROM users;`);
        const loansCount = (await client.query(`SELECT COUNT(*) FROM loans WHERE status = 1;`))[0]["COUNT(*)"];

        // Compile all the loan details into an array
        let userID, loanID, paid, payable;
        for (let i = 0; i < loansCount; i++) {
            userID = ((await client.query(`SELECT id FROM users WHERE id = "${loanDetails[i].borrower_id}";`))[0]).id;
            loanID = ((await client.query(`SELECT id FROM loans WHERE id = "${loanDetails[i].id}";`))[0]).id;
            paid = loanDetails.filter(loan => loan.id === loanID)[0].total_paid ?? "0.00";
            payable = loanDetails.filter(loan => loan.id === loanID)[0].total_payable;
            if (paid >= payable) { continue; }
            loans.push({
                loan_id: loanID,
                name: usernames.filter(user => user.id === userID)[0].name,
                id: userID,
                first_payment_date: loanDetails.filter(loan => loan.id === loanID)[0].first_payment_date,
                loan_product_id: loanDetails.filter(loan => loan.id === loanID)[0].loan_product_id,
                term: loanTerms.filter(term => term.id === loanDetails[i].loan_product_id)[0].term,
                term_period: loanTerms.filter(term => term.id === loanDetails[i].loan_product_id)[0].term_period,
                loan_amount: loanDetails.filter(loan => loan.id === loanID)[0].applied_amount,
                loan_paid: paid,
                loan_payable: payable
            });
        }

        let amountDue = 0;
        let tomorrow = new Date();
        tomorrow.setDate((new Date()).getDate() + 1);

        for (let i = 0; i < loans.length; i++) {
            let periodDate = new Date();
            let paymentDate = loans[i].first_payment_date;

            for (let j = 0; j < loans[i].term; j++) {
                // Add the term period to the payment date
                periodDate.setDate(paymentDate.getDate() + (convertPeriodToDays(loans[i].term_period) * j));

                // Check all period dates to see if they match tomorrow's date
                if (periodDate.getDate() === tomorrow.getDate() && periodDate.getMonth() === tomorrow.getMonth() && periodDate.getFullYear() === tomorrow.getFullYear()) {
                    amountDue = +(Math.round((loans[i].loan_payable / loans[i].term) + "e+2") + "e-2");
                    const user = await client.users.fetch(loans[i].name);
                    const reminderEmbed = new EmbedBuilder()
                        .setTitle("Loan Payment Reminder")
                        .setDescription(`This is a reminder that your loan payment is due tomorrow. Please make sure to pay your loan payment on time to avoid any late fees.`)
                        .addFields(
                            {
                                name: "Loan Payment",
                                value: `**Loan Amount Due:** $${amountDue}
                                **Current Loan Term:** ${convertDaysToPeriod(convertPeriodToDays(loanTerms[i].term_period) * j)}`,
                                inline: true
                            },
                            {
                                name: "Loan Details",
                                value: `**Loan Amount:** $${loans[i].loan_amount}` +
                                    `\n**Loan Payable:** $${loans[i].loan_payable}` +
                                    `\n**Loan Paid:** $${loans[i].loan_paid}` +
                                    `\n**Loan Term:** ${loans[i].term}` +
                                    `\n**Loan Term Period:** ${loans[i].term_period}`,
                                inline: true
                            }
                        )
                        .setColor("#2F3136")
                        .setTimestamp()
                        .setFooter({ text: `JPMCU • Loan ID#${loans[i].loan_id}`, iconURL: client.user.avatarURL() });

                    console.log(`Send to ${loans[i].name} that their loan payment is due tomorrow.`);
                    await user.send({ embeds: [reminderEmbed] });

                }
            }
        }
    } catch (err) {
        console.log(err);
    }
},
    {
        timezone: "America/Chicago"
    }
);

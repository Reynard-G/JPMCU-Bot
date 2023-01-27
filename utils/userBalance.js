exports.getBalance = async function (client, discordUserID) {
    const balance = (await client.query(`SELECT SUM(CASE WHEN dr_cr = "cr" THEN amount ELSE -amount END) FROM transactions WHERE user_id = (SELECT id FROM users WHERE name = "${discordUserID}")`))[0]["SUM(CASE WHEN dr_cr = \"cr\" THEN amount ELSE -amount END)"];
    return balance;
}
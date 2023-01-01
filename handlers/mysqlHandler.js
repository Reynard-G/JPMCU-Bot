const chalk = require('chalk');
var AsciiTable = require('ascii-table');
var table = new AsciiTable();
table.setHeading('MySQL', 'Stats').setBorder('|', '=', "0", "0");
const mariadb = require('mariadb');

module.exports = (client) => {
    require('dotenv').config();
    const pool = mariadb.createPool({
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        timezone: 'America/Chicago',
        connectionLimit: 5
    });


    client.query = async (sql, args) => {
        const conn = await pool.getConnection();
        const result = await conn.query(sql, args);
        conn.release();
        return delete result.meta ? result : result[0];
    };

    table.addRow("MySQL Connection", '✅');
    console.log(chalk.blue(table.toString()));
};
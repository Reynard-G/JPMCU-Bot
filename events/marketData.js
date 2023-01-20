// Create a cronjob that runs every minute to update the market data with alpaca
const fs = require('fs');
const cron = require('node-cron');
const client = require('..');
const Alpaca = require('@alpacahq/alpaca-trade-api');

require('dotenv').config();
const alpaca = new Alpaca({
    keyId: process.env.ALPACA_KEY_ID,
    secretKey: process.env.ALPACA_SECRET_KEY,
    paper: true
});

cron.schedule('* * * * *', async () => {
    try {
        const marketData = await alpaca.getLatestTrades(client.stockTickers);
        const cryptoMarketData = await alpaca.getLatestCryptoTrades(
            client.cryptoTickers,
            { exchange: "ERSX", }
        );

        // Save the data to the database (../database/marketData.json & ../database/cryptoMarket.json)
        fs.writeFileSync('data/stockMarket.json', JSON.stringify(Object.fromEntries(marketData), null, 4), 'utf8');
        fs.writeFileSync('data/cryptoMarket.json', JSON.stringify(Object.fromEntries(cryptoMarketData), null, 4), 'utf8');
        console.log('Market data updated.')
    } catch (err) {
        console.log(err);
    }
});
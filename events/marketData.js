// Create a cronjob that runs every minute to update the market data with alpaca
const fs = require('fs');
const cron = require('node-cron');
const moment = require('moment');
const client = require('..');

// Stock price data
cron.schedule('* * * * *', async () => {
    try {
        const marketData = await client.alpaca.getLatestTrades(Object.keys(client.stockTickers));
        const cryptoMarketData = await client.alpaca.getLatestCryptoTrades(
            Object.keys(client.cryptoTickers),
            { exchange: "ERSX", }
        );

        // Save the data to the database
        fs.writeFileSync('data/stockMarket.json', JSON.stringify(Object.fromEntries(marketData), null, 4), 'utf8');
        fs.writeFileSync('data/cryptoMarket.json', JSON.stringify(Object.fromEntries(cryptoMarketData), null, 4), 'utf8');
    } catch (err) {
        console.log(err);
    }
}, {
    scheduled: true,
    timezone: 'America/Chicago'
});

// Stock price bar data
/*client.on('ready', async () => {
    //cron.schedule('0 15 * * *', async () => {
    try {
        // Get the bar data for the last year
        const barStockData = await client.alpaca.getMultiBarsV2(
            Object.keys(client.stockTickers),
            {
                start: moment().subtract(1, 'year').format(),
                end: moment().subtract(20, 'minutes').format(),
                timeframe: '1Day',

            }
        );
        const barCryptoData = await client.alpaca.getMultiBarsV2(
            Object.keys(client.cryptoTickers),
            {
                start: moment().subtract(1, 'year').format(),
                end: moment().subtract(20, 'minutes').format(),
                timeframe: '1Day',
                exchange: 'ERSX'
            }
        );

        // Save data to json file
        fs.writeFileSync('data/stockBarData.json', JSON.stringify(Object.fromEntries(barStockData), null, 4), 'utf8')
        fs.writeFileSync('data/cryptoBarData.json', JSON.stringify(Object.fromEntries(barCryptoData), null, 4), 'utf8')
        console.log('Bar data updated.');
    } catch (err) {
        console.log(err);
    }
}, {
    scheduled: true,
    timezone: 'America/Chicago'
});
*/
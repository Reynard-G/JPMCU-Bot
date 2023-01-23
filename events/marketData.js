// Create a cronjob that runs every minute to update the market data with alpaca
const fs = require('fs/promises');
const Cron = require('croner');
const moment = require('moment');
const QuickChart = require('quickchart-js');
const client = require('..');

async function generateCharts(symbols, bars) {
    const chart = new QuickChart();
    for (let symbol of symbols) {
        chart.setWidth(500);
        chart.setHeight(300);
        chart.setVersion('3');

        // Set the chart data
        let dataArr = [];
        bars.filter(b => b.Symbol === symbol).map(b => dataArr.push({ x: new Date(b.Timestamp).getTime(), o: b.OpenPrice ?? b.Open, h: b.HighPrice ?? b.High, l: b.LowPrice ?? b.Low, c: b.ClosePrice ?? b.Close }));
        chart.setConfig({
            type: 'candlestick',
            data: {
                datasets: [
                    {
                        data: dataArr
                    }
                ],
            },
            options: {
                scales: {
                    x: {
                        adapters: {
                            date: {
                                zone: 'UTC-6'
                            }
                        },
                        time: {
                            unit: 'day',
                            stepSize: 7,
                            displayFormats: {
                                day: 'MMM d',
                                month: 'MMM d',
                            }
                        },
                        ticks: {
                            autoSkip: true,
                        },
                    },
                    y: {
                        ticks: {
                            callback: (label) => `$${label}`,
                        },
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `${symbol} Share Price Chart (1 Year)`,
                    },
                    legend: {
                        display: false,
                    },
                },
            },
        });
        await fs.writeFile(`data/charts/${symbol}BarChart.png`, await chart.toBinary(), 'binary');
    }
}

// Stock price data, run every minute
Cron('* * * * *', async () => {
    try {
        const marketData = await client.alpaca.getLatestTrades(Object.keys(client.stockTickers));
        const cryptoMarketData = await client.alpaca.getLatestCryptoTrades(
            Object.keys(client.cryptoTickers),
            { exchange: "CBSE", }
        );

        // Save the data to the database
        await fs.writeFile('data/stockMarket.json', JSON.stringify(Object.fromEntries(marketData), null, 4), 'utf8');
        await fs.writeFile('data/cryptoMarket.json', JSON.stringify(Object.fromEntries(cryptoMarketData), null, 4), 'utf8');
    } catch (err) {
        console.log(err);
    }
}, {
    timezone: 'America/Chicago'
});

// Stock price bar data, run every week at 3pm CST
Cron('0 15 * * 0', async () => {
    try {
        // Get the bar data for the last year
        const barStockData = await client.alpaca.getMultiBarsAsyncV2(
            Object.keys(client.stockTickers),
            {
                start: moment().subtract(1, 'year').format(),
                end: moment().subtract(20, 'minutes').format(),
                timeframe: '1Week',

            }
        );
        const stockBars = [];
        for await (let b of barStockData) {
            stockBars.push(b);
        }

        let cryptoBars = [];
        for await (let ticker of Object.keys(client.cryptoTickers)) {
            let barCryptoData = await client.alpaca.getCryptoBars(
                ticker,
                {
                    start: moment().subtract(1, 'year').format(),
                    end: moment().subtract(20, 'minutes').format(),
                    timeframe: '1Week',
                }
            );
            for await (let b of barCryptoData) {
                cryptoBars.push(b);
            }
        }
        cryptoBars = cryptoBars.filter(b => b.Exchange === 'CBSE');

        // Save data to json file
        await fs.writeFile('data/stockBarData.json', JSON.stringify(stockBars, null, 4), 'utf8');
        await fs.writeFile('data/cryptoBarData.json', JSON.stringify(cryptoBars, null, 4), 'utf8');
        console.log('Bars data updated.');

        // Create multiple charts for each stock using Symbol in object
        const stockSymbols = new Set(stockBars.map(b => b.Symbol));
        const cryptoSymbols = new Set(cryptoBars.map(b => b.Symbol));

        await generateCharts(stockSymbols, stockBars);
        await generateCharts(cryptoSymbols, cryptoBars);

        console.log('Charts updated.');
    } catch (err) {
        console.log(err);
    }
}, {
    timezone: 'America/Chicago'
});

const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent
	],
	partials: [
		Partials.Channel,
		Partials.Message,
		Partials.User,
		Partials.GuildMember,
		Partials.Reaction
	]
});
const Alpaca = require('@alpacahq/alpaca-trade-api');

const fs = require('fs');
require('dotenv').config();

client.alpaca = new Alpaca({
    keyId: process.env.ALPACA_KEY_ID,
    secretKey: process.env.ALPACA_SECRET_KEY,
    paper: true
});
client.aliases = new Collection();
client.slashCommands = new Collection();
client.subCommands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.cryptoTickers = {
	"BTCUSD": "Bitcoin USD",
	"ETHUSD": "Ethereum USD"
};
client.stockTickers = {
	"GOOGL": "Alphabet Inc.",
	"NSANY": "Nissan Motor Co. Ltd.",
	"AAPL": "Apple Inc.",
	"TSLA": "Tesla Inc.",
	"V": "Visa Inc.",
	"PEP": "PepsiCo Inc.",
	"WMT": "Walmart Inc.",
	"AMZN": "Amazon.com Inc.",
	"EBAY": "eBay Inc.",
	"LUV": "Southwest Airlines Co.",
	"JPM": "JPMorgan Chase & Co.",
	"T": "AT&T Inc.",
	"SSNLF": "Samsung Electronics Co. Ltd.",
	"FDX": "FedEx Corporation",
	"KR": "Kroger Co.",
	"COST": "Costco Wholesale Corporation",
	"PNRA": "Panera Bread Company",
	"SBUX": "Starbucks Corporation",
	"DNKN": "Dunkin' Brands Group Inc.",
	"WBA": "Walgreens Boots Alliance Inc.",
	"CVS": "CVS Health Corporation",
	"MCD": "McDonald's Corporation",
	"QSR": "Restaurant Brands International Inc.",
	"META": "Metropolitan Bank Holding Corp.",
	"CMG": "Chipotle Mexican Grill Inc.",
	"YUM": "Yum! Brands Inc. (KFC, Pizza Hut, Taco Bell)",
	"CSCO": "Cisco Systems Inc.",
	"HLT": "Hilton Worldwide Holdings Inc.",
	"MSFT": "Microsoft Corporation",
	"INTC": "Intel Corporation",
	"KHC": "The Kraft Heinz Company",
	"WFC": "Wells Fargo & Co.",
	"MPC": "Marathon Petroleum Corporation",
	"HBAN": "Huntington Bancshares Inc.",
	"LOW": "Lowe's Companies Inc.",
	"HD": "The Home Depot Inc.",
	"PPRUY": "Porsche Automobil Holding SE",
	"CPRI": "Capri Holdings Limited",
	"PRDSF": "Porsche SE",
	"CCL": "Carnival Corporation",
	"DIS": "The Walt Disney Company",
	"VZ": "Verizon Communications Inc.",
	"TMUS": "T-Mobile US Inc.",
	"NFLX": "Netflix Inc.",
	"AMD": "Advanced Micro Devices Inc.",
	"NVDA": "NVIDIA Corporation",
	"AXP": "American Express Company",
	"F": "Ford Motor Company",
	"GM": "General Motors Company",
	"SHEL": "Shell Oil Company",
	"UPS": "United Parcel Service Inc.",
	"UAL": "United Airlines Holdings Inc.",
	"SHOP": "Shopify Inc."
};

module.exports = client;

fs.readdirSync('./handlers').forEach((handler) => {
	require(`./handlers/${handler}`)(client);
});

client.login(process.env.TOKEN);

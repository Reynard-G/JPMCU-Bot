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
	partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
});

const fs = require('fs');
require('dotenv').config();

client.aliases = new Collection();
client.slashCommands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.cryptoTickers = [
	"BTCUSD",
	"ETHUSD"
];
client.stockTickers = [
	"GOOGL",
	"NSANY",
	"AAPL",
	"TSLA",
	"V",
	"PEP",
	"WMT",
	"AMZN",
	"EBAY",
	"LUV",
	"JPM",
	"T",
	"SSNLF",
	"FDX",
	"KR",
	"COST",
	"PNRA",
	"SBUX",
	"DNKN",
	"WBA",
	"CVS",
	"MCD",
	"QSR",
	"META",
	"CMG",
	"YUM",
	"CSCO",
	"HLT",
	"MSFT",
	"INTC",
	"KHC",
	"WFC",
	"MPC",
	"HBAN",
	"LOW",
	"HD",
	"PPRUY",
	"CPRI",
	"PRDSF",
	"CCL",
	"DIS",
	"VZ",
	"TMUS",
	"NFLX",
	"AMD",
	"NVDA",
	"AXP",
	"F",
	"GM",
	"SHEL",
	"UPS",
	"UAL",
	"SHOP"
];

module.exports = client;

fs.readdirSync('./handlers').forEach((handler) => {
	require(`./handlers/${handler}`)(client);
});

client.login(process.env.TOKEN);

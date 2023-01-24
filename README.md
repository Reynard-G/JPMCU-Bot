<img src="https://www.democracycraft.net/business-portal/jpm-credit-union.191/cover-image" width="250" height="250">

# JPMCU Discord Bot

The JPMCU Bot is responsible for integrating JPMCU's website right into Discord

## Commands/Features

- `/register` - Register an account with JPMCU
- `/membership` - Apply for JPMCU membership. Requires at least $850 in your account
- `/balance` - Check your JPMCU account balance
- `/transactions` - Check your JPMCU account transaction history
- `/info` - Information about JPMCU
- `/market hours` - Displays the real-life market hours
- `/market tickers` - Display available tickers
- `/market info` - Display current share price with 1 year chart
- Loan Reminders a day before a payment is due
- Automating interest payments for Administrators

## Installation

```bash
  git clone https://github.com/Reynard-G/JPMCU-Bot
  cd JPMCU-Bot
  mkdir data/
  cd data/
  touch cryptoBarData.json cryptoMarket.json stockBarData.json stockMarket.json
  mkdir charts
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

```txt
TOKEN=
CLIENT_ID=
GUILD_ID= // Fill if you want to register slashcommands in a specific guild
MEMBER_ROLE_ID=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASS=
DB_NAME=
ALPACA_KEY_ID=
ALPACA_SECRET_KEY=
```

## Run Locally

Install dependencies

```bash
  npm install
```

Start the discord bot

```bash
  node .
```

## License

[GNU Lesser General Public License v3.0](https://choosealicense.com/licenses/lgpl-3.0/)

<img src="https://www.democracycraft.net/business-portal/jpm-credit-union.191/cover-image" width="250" height="250">

# JPMCU Discord Bot
The JPMCU Bot is responsible for integrating JPMCU's website right into Discord 


## Commands/Features
- `/register` - Register an account with JPMCU
- `/membership` - Apply for JPMCU membership. Requires at least $850 in your account
- `/balance` - Check your JPMCU account balance
- `/transactions` - Check your JPMCU account transaction history
- `/info` - Information about JPMCU
- Loan Reminders a day before a payment is due
- Automating interest payments for Administrators

## Installation
```bash
  git clone https://github.com/Reynard-G/JPMCU-Bot
  cd JPMCU-Bot
```
    
## Environment Variables
To run this project, you will need to add the following environment variables to your .env file
```env
TOKEN=
CLIENT_ID=
GUILD_ID= // Fill if you want to register
MEMBER_ROLE_ID=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASS=
DB_NAME=
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

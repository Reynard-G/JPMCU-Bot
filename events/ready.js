const { ActivityType } = require("discord.js");
const client = require("..");
const chalk = require("chalk");

client.on("ready", () => {
	const activities = [
		{ name: `${client.users.cache.size} customers`, type: ActivityType.Watching },
		{ name: `with money`, type: ActivityType.Playing },
		{ name: `music`, type: ActivityType.Listening },
		{ name: `the Banking Market`, type: ActivityType.Competing }
	];
	const status = [
		"dnd"
	];
	let i = 0;
	setInterval(() => {
		if (i >= activities.length) i = 0;
		client.user.setActivity(activities[i]);
		i++;
	}, 5000);

	let s = 0;
	setInterval(() => {
		if (s >= activities.length) s = 0;
		client.user.setStatus(status[s]);
		s++;
	}, 30000);
	console.log(chalk.red(`Logged in as ${client.user.tag}!`));
});
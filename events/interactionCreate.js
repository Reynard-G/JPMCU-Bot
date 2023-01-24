const { EmbedBuilder, Collection, PermissionsBitField } = require("discord.js");
const moment = require("moment");
const client = require("..");

const cooldown = new Collection();

client.on("interactionCreate", async interaction => {
	const slashCommand = client.slashCommands.get(interaction.commandName);

	if (interaction.type === 4) {
		if (slashCommand.autocomplete) {
			const choices = [];
			await slashCommand.autocomplete(interaction, choices);
		}
	}
	if (!interaction.type === 2) return;
	if (!slashCommand) return client.slashCommands.delete(interaction.commandName);

	const subCommandOption = interaction.options.getSubcommand(false) || interaction.options.getSubcommandGroup(false);
	try {
		if (slashCommand.cooldown) {
			if (cooldown.has(`slash-${slashCommand.name}${interaction.user.id}`)) {
				const cooldownEmbed = new EmbedBuilder()
					.setTitle("Cooldown")
					.setDescription(`You are currently on cooldown. Please wait **${moment.duration(cooldown.get(`slash-${slashCommand.name}${interaction.user.id}`) - Date.now()).asSeconds()}s**.`)
					.setColor("Red")
					.setTimestamp()
					.setFooter({ text: `${interaction.user.id} `, iconURL: interaction.user.displayAvatarURL() });

				return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
			}
			cooldown.set(`slash-${slashCommand.name}${interaction.user.id}`, Date.now() + slashCommand.cooldown);
			setTimeout(() => {
				cooldown.delete(`slash-${slashCommand.name}${interaction.user.id}`);
			}, slashCommand.cooldown);
		}
		
		if (slashCommand.userPerms || slashCommand.botPerms) {
			if (!interaction.memberPermissions.has(PermissionsBitField.resolve(slashCommand.userPerms || []))) {
				const userPerms = new EmbedBuilder()
					.setDescription(`🚫 ${interaction.user}, You don't have \`${slashCommand.userPerms}\` permissions to use this command!`)
					.setColor("Red");
				return interaction.reply({ embeds: [userPerms], ephemeral: true });
			}
			if (!interaction.guild.members.cache.get(client.user.id).permissions.has(PermissionsBitField.resolve(slashCommand.botPerms || []))) {
				const botPerms = new EmbedBuilder()
					.setDescription(`🚫 ${interaction.user}, I don't have \`${slashCommand.botPerms}\` permissions to use this command!`)
					.setColor("Red");
				return interaction.reply({ embeds: [botPerms] });
			}

		}

		// Subcommand handler
		if (subCommandOption) {
			const subCommand = client.subCommands.get(subCommandOption);
			if (subCommand) {
				subCommand.run(client, interaction);
			}
		} else {
			await slashCommand.run(client, interaction);
		}
	} catch (error) {
		console.log(error);
	}
});
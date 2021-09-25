/**
	@module argss/time
	@desc This is the core args of the client, controlling the configuration for the nickname.
	@author JGylgamesh <janto.ffxiv@googlemail.com>
**/

/**
	@desc The function that's triggered by the onMessage event
	@type function
	@param msg {Object} Message object from Discord.js
**/

const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
	name: "time",
	aliases: [""],
	description: "Configures the timezone and nickname of the client",
	async execute(msg, args) {
		
		console.log("Running time command");
	
		let parentModule = this;
		let hasPerms = msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || msg.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)
		let config = storage.getItemSync(msg.guild.id);
		let thisServer = {};
		if (config) {
			thisServer = JSON.parse(config);
		}
		
		if(!args[0]) {
			if(hasPerms) {
				let response = {
					name: 'Status'
				};
				let color = colorConfig.neutral;
				if (Object.keys(thisServer).length) {
					color = colorConfig.good;
					response.value = ":white_check_mark: All set for **" + msg.guild.name + "**. \n\nFeel free to run `!time help` for configuration & more information.";
				} else {
					color = colorConfig.bad;
					response.value = ":exclamation: Not yet configured. \n\nPlease run `!time start` to get set up. It's a super quick process.";
				}
				msg.channel.send({embeds: [new MessageEmbed()
					.setColor(color)
					.setTitle(botConfig.title)
					.addFields([response])
				]});
			} else {
				msg.channel.send('Sorry, it looks like you don\'t have permission to to run this command. Please contact an admin to be told off. Don\'t worry, they\'re not angry, just disappointed.');
			}
		} else {
			switch(args[0]) {
				case 'start':
					if(hasPerms) {
						if(!Object.keys(thisServer).length) {
							msg.channel.send({embeds: [new MessageEmbed()
								.setColor(colorConfig.good)
								.setTitle(botConfig.title)
								.setDescription('Initial setup for **' + msg.guild.name + '**')
								.addFields([{
									name: 'Adding server to our database..',
									value: "It looks like this server is in **" + msg.guild.region + "**, so to speed up the process we're setting your default timezone to **" + defaultConfig.zones[msg.guild.region] + "**. \n\n" +
											"If this is incorrect, or you would like to customize the timezone further, `!time zone` will provide you with more information. You can also use `!time format` to change how the time/date is displayed. \n\n:thumbsup: That's it! You're good to go."
								}])
							]});
							let thisServer = {};
							console.log("Setting defaults for " + msg.guild.name);
							if(defaultConfig.zones[msg.guild.region]) {
								thisServer.zone = defaultConfig.zones[msg.guild.region];
							} else {
								thisServer.zone = defaultConfig.zone;
							}
							thisServer.format = defaultConfig.format;
							thisServer.owner = msg.member.displayName;
							storage.setItemSync(msg.guild.id, JSON.stringify(thisServer));
							msg.guild.members.cache.get(client.user).then(function(member) {
								member.setNickname(moment().tz(thisServer.zone).format(thisServer.format));
							});
						} else {
							msg.channel.send('Sorry, it looks like you don\'t have permission to to run this command. Please contact an admin to be told off. Don\'t worry, they\'re not angry, just disappointed.');
						}
					} else {
						msg.channel.send('Sorry, it looks like you don\'t have permission to to run this command. Please contact an admin to be told off. Don\'t worry, they\'re not angry, just disappointed.');
					}
					break;
				case 'zone': // TODO Ensure client is configured for this server first
					if(hasPerms) {
						if(args[1] && hasPerms) {
							let newZone = args[1];
							if(moment.tz.zone(newZone)) {
								thisServer.zone = newZone;
								storage.setItemSync(msg.guild.id, JSON.stringify(thisServer));
								msg.channel.send({embeds: [new MessageEmbed()
									.setColor(colorConfig.good)
									.setTitle(botConfig.title)
									.addFields([{
										name: 'Timezone successfully updated',
										value: "Set to " + thisServer.zone
									}])
								]});
							} else {
								msg.channel.send({embeds: [new MessageEmbed()
									.setColor(colorConfig.good)
									.setTitle(botConfig.title)
									.addFields([{
										name: 'Sorry, that\'s not a valid timezone. \nRun `!time zone` for full details.',
										value: "For now, we're sticking with " + thisServer.zone
									}])
								]});
							}
						} else {
							msg.channel.send({embeds: [new MessageEmbed()
								.setColor(colorConfig.good)
								.setTitle(botConfig.title)
								.addFields([{
									name: "Current timezone: " + thisServer.zone,
									value: "It's currently " + moment().tz(thisServer.zone).format(thisServer.format)
								}])
							]});
						}
					} else {
						msg.channel.send('Sorry, it looks like you don\'t have permission to to run this args. Please contact an admin to be told off. Don\'t worry, they\'re not angry, just disappointed.');
					}
					break;
				case 'format':
					if(hasPerms) {
						let thisargs = "time format";
						let format = msg.content.replace(thisargs + ' ', '').substring(1);
						if (format.length && Object.keys(thisServer).length) {
							if (format == "default") {
								thisServer.format = defaultConfig.format;
							} else {
								thisServer.format = format;
							}
							storage.setItemSync(msg.guild.id, JSON.stringify(thisServer));
							msg.channel.send("Set format to '" + thisServer.format + "' (preview: " + moment().tz(thisServer.zone).format(thisServer.format) + ")");
						} else if (Object.keys(thisServer).length) {
							msg.channel.send("Current time format (& help info): " + thisServer.format);
						} else {
							msg.channel.send("No config found.");
						}
					} else {
						msg.channel.send('Sorry, it looks like you don\'t have permission to to run this args. Please contact an admin to be told off. Don\'t worry, they\'re not angry, just disappointed.');
					}
					break;
				case 'server':
					let clientServer = {name: 'client Configuration'};
					if (Object.keys(thisServer).length) {
						clientServer.value = '**Timezone**: ' + thisServer.zone + '\n' + 
								'**Format**: ' + thisServer.format + '\n' +
								'**Preview**: ' + moment().tz(thisServer.zone).format(thisServer.format) + '\n' +
								'_Original config was done by ' + thisServer.owner + "_";
					} else {
						clientServer.value = "No configuration found! Please run `!time start` first.";
					}
					msg.channel.send({embeds: [new MessageEmbed()
						.setColor(colorConfig.neutral)
						.setTitle(botConfig.title)
						.setDescription('`!time server` Details about the client\'s configuration on this server.')
						.addFields([
							clientServer,
							{
								name: "Server Details",
								value: '**Name**: ' + msg.guild.name + '\n' +
									'**ID**: ' + msg.guild.id + '\n' +
									'**Region**: ' + msg.guild.region
							}
						])
					]});
					break;
				case 'help':
					msg.channel.send({embeds: [new MessageEmbed()
						.setColor(colorConfig.neutral)
						.setTitle(botConfig.title)
						.setDescription('Below you will find all the details on how to get this client up and running on your server.')
						.addFields([{
							name: 'Time client? What\'s that?',
							value: 'Timezones are hard. This client sits in your server\'s member list (the sidebar on the right) and displays the time and date for your community. It\'s that simple.'
						},
						{
							name: 'argss',
							value: '`!time help` Show this help menu' + '\n' +
								'`!time server` Show details about the client\'s config' + '\n' +
								(hasPerms ? '`!time zone [region]` Set the timezone' + '\n' : '') +
								(hasPerms ? '`!time format [layout]` Set the time/date format' + '\n' : '') +
								'`!time defaults` Show the default configuration' + '\n' + 
								'`!time client` Show general client statistics' + '\n' + 
								'`!time in [region]` Show the time in a zone' + '\n'
						},
						{
							name: 'How do I get it on my server?',
							value: 'Nice! You can\'t just yet - the code is being perfected. But soon.'
						}
						])
					]});
					break;
				case 'bot':
					msg.channel.send({embeds: [new MessageEmbed()
						.setColor(colorConfig.neutral)
						.setTitle(botConfig.title)
						.setDescription('Global client information')
						.addFields([{
							name: 'Statistics',
							value: "**Uptime**: " + client.uptime + "ms" + "\n" +
								"**Servers**: " + storage.keys().length + " configured, " + client.guilds.cache.size + " total"
						}])
					]});
					break;
				case 'defaults':
					msg.channel.send({embeds: [new MessageEmbed()
						.setColor(colorConfig.neutral)
						.setTitle(botConfig.title)
						.setDescription('`!time defaults` Original defaults for this client.')
						.addFields([{
							name: 'Preview: ' + moment().tz(defaultConfig.zone).format(defaultConfig.format),
							value: '**Timezone**: `' + defaultConfig.zone + '`' + '\n' + 
								'**Format**: `' + defaultConfig.format + '`' + '\n' + 
								'**Regions**: `' + JSON.stringify(defaultConfig.zones, null, 2) + '`' + '\n'
						}
						])
					]});
					break;
				case 'in':
					msg.channel.send({embeds: [new MessageEmbed()
						.setColor(colorConfig.neutral)
						.setTitle(botConfig.title)
						.setDescription('`!time in [zone]` Check a timezone!')
						.addFields([{
							name: 'You requested ' + args[1],
							value: "It is currently " + moment().tz(args[1]).format('h:mm A [on] dddd')
						}])
					]});
					break;
			}
		}
	}
};
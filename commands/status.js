/**
	@module commands/status
	@desc This command allows you to set the status of the bot.
	@author JGylgamesh <janto.ffxiv@googlemail.com>
**/

/**
	@desc The function that's triggered by the onMessage event
	@type function
	@param msg {Object} Message object from Discord.js
**/

const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {	
	name: "status",
	aliases: [""],
	description: "Configures the timezone and nickname of the bot",
	
	async execute(msg, args) {
		
		let parentModule = this;
		let command = msg.content.replace(/( {2,})/g, ' ').split(' ');
		let hasPerms = msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || msg.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD)
		let config = storage.getItemSync(msg.guild.id);
		let thisServer = {};
		if (config) {
			thisServer = JSON.parse(config);
		}
		
		if(!args[0]) {
			if(hasPerms) {
				let response = {
					name: 'Error',
					value: ":exclamation: Additional parameters are required to run this command. Please contact an admin for more information."
				};
				let color = colorConfig.bad;
				msg.channel.send({embeds: [new MessageEmbed()
					.setColor(color)
					.setTitle(botConfig.title)
					.addFields([response])
				]});
			} else {
				errorResponse('perms', 'status');
			}
		} else {
			switch(args[0]) {
				case 'watching':
					if(hasPerms) {
						let thisServer = {};
						console.log("Setting status for " + msg.guild.name);
						let sts = args.slice(1).join(' ');
						client.user.setActivity(sts, {type: "WATCHING"});
					} else {
						errorResponse('set');
					}
					break;
				case 'playing':
					if(hasPerms) {
						let thisServer = {};
						console.log("Setting status for " + msg.guild.name);
						let sts = args.slice(1).join(' ');
						client.user.setActivity(sts, {type: "PLAYING"});
					} else {
						errorResponse('perms', 'status');				}
					break;
				case 'listening':
					if(hasPerms) {
						let thisServer = {};
						console.log("Setting status for " + msg.guild.name);
						let sts = args.slice(1).join(' ');
						client.user.setActivity(sts, {type: "LISTENING"});
					} else {
						errorResponse('perms', 'status');
					}
					break;
			}
		}
	}
}
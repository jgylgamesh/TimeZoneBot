/**
	@module timeclient
	@author JGylgamesh <janto.ffxiv@googlemail.com>
	@desc This is the core file of the client. Run it using `npm run client`
**/

/**
 * Module Imports
 */
const { Client, Collection, Intents} = require("discord.js");
global.fs = require("fs");
const { readdirSync } = require("fs");
const { join } = require("path");

global.moment = require('moment');
global.timezone = require('moment-timezone');
global.storage = require('node-persist');
global.schedule = require('node-schedule');

const { TOKEN, PREFIX } = require("./util/Util");
global.botConfig = require("./util/Util");
global.colorConfig = require('./config/colors.js');
global.defaultConfig = require('./config/defaults.js');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

global.client = new Client({
  disableMentions: "everyone",
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"]
});

client.login(TOKEN); 
client.commands = new Collection();
client.prefix = PREFIX;

/**
 * Import all commands
 */
const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", `${file}`));
  client.commands.set(command.name, command);
}

/**
 * Message handler
 */

client.on("messageCreate", async (message) => {
  // if (message.author.client) return;
  // if (!message.guild) return;

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(client.prefix)})\\s*`);
  if (!(message.content.indexOf(PREFIX) == 0)) {
	  return;
  }

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) {
	  return;
  }
  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply({content: "There was an error with the ${command} command, please check with an admin how you\'re meant to use it."}).catch(console.error);
  }
});

storage.initSync();
let scheduledJob = {};

/**
 * @desc Initial launch function
 * @listens client:login
 * @function
 */
function handleLogin() {
	console.log('Discord Time client is now online!');
	/*
	client.user.setGame('with ' + clientConfig.prefix + 'time');
	*/
	client.user.setActivity('Construct 7 dance!', {type: 'WATCHING'});
	/**
	 * @desc Time function that updates the client's nickname in every server
	 * @function
	 */
	function setTime() {
		let promise = Promise.resolve();
		client.guilds.cache.each((guild) => {
			promise = promise.then(function() {
				guild.members.fetch(client.user).then(function (member) {
					if (member.id == client.user.id) {
						let data = storage.getItemSync(guild.id);
						let thisServer = {};
						try {
							if (data) {
								thisServer = JSON.parse(data);
							}
						} catch (error) {
							console.log("Failed to load data for " + guild.name + ": " + error);
						}

						if (!Object.keys(thisServer).length) {
							member.setNickname("Not Configured");
						} else {
							// console.log(guild.name + " has: " + JSON.stringify(thisServer));
							try {
								let newNick = moment().tz(thisServer.zone).format(thisServer.format);
								setTimeout(function() {
									// console.log("Setting time for " + guild.name);
									// console.log("The time is " + moment().tz(thisServer.zone).format(thisServer.format) + ".");
									// console.log("New nickname is " + newNick);
									member.setNickname(newNick)
										.catch(err => console.log(err));
									// console.log("Nickname set for " + guild.name);
									// console.log("Nickname set to " + member.nickname);
								}, 1000);							
							} catch (error) {
								console.log("Error setting nickname");
							}
						}
					} else { 
						console.log("not client user");
					}
				}).catch(function (error) {
					console.warn("Failed fetching members.");
				});
				return new Promise(function(resolve) {
					setTimeout(resolve, 1000);
				});
			});
		});
	}
	setTime();
	scheduledJob = schedule.scheduleJob('* * * * *', setTime);
	
}

function updateTime() {
	/**
	 * @desc Time function that updates the client's nickname in every server
	 * @function
	 */
	function setTime() {
		let promise = Promise.resolve();
		client.guilds.cache.each((guild) => {
			promise = promise.then(function() {
				guild.members.fetch(client.user).then(function (member) {
					if (member.id == client.user.id) {
						let data = storage.getItemSync(guild.id);
						let thisServer = {};
						try {
							if (data) {
								thisServer = JSON.parse(data);
							}
						} catch (error) {
							console.log("Failed to load data for " + guild.name + ": " + error);
						}

						if (!Object.keys(thisServer).length) {
							member.setNickname("Not Configured");
						} else {
							// console.log(guild.name + " has: " + JSON.stringify(thisServer));
							try {
								let newNick = moment().tz(thisServer.zone).format(thisServer.format);
								setTimeout(function() {
									// console.log("Setting time for " + guild.name);
									// console.log("The time is " + moment().tz(thisServer.zone).format(thisServer.format) + ".");
									// console.log("New nickname is " + newNick);
									member.setNickname(newNick)
										.catch(err => console.log(err));
									// console.log("Nickname set for " + guild.name);
									// console.log("Nickname set to " + member.nickname);
								}, 1000);							
							} catch (error) {
								console.log("Error setting nickname");
							}
						}
					} else { 
						console.log("not client user");
					}
				}).catch(function (error) {
					console.warn("Failed fetching members.");
				});
				return new Promise(function(resolve) {
					setTimeout(resolve, 1000);
				});
			});
		});
	}
	setTime();
	scheduledJob = schedule.scheduleJob('* * * * *', setTime);

}

function handleDisconnect() {
	if (scheduledJob) {
		scheduledJob.cancel();
	}
}

/**
 * @desc Attempt to log into Discord's servers. Handle as many errors as we can instead of crashing.
 * @function
 */
 
/**
 * Client Events
 */
client.on('ready', handleLogin);
client.on('resume', updateTime);
client.on('reconnecting', handleDisconnect);
client.on('error', () => {
	console.error;
	handleDisconnect();
});
client.on('disconnect', (event) => {
	console.warn("Disconnected as Discord's servers are unreachable.");
	handleDisconnect();
});
client.on('rateLimit', (info) => {
	console.log('Rate limit hit\nGlobal limit: ' + info.global + '\nMethod: ' + info.method + '\nRequest path relative to endpoint: ' + info.path + '\nRequest route relative to endpoint: ' + info.route + '\nLimit on endpoint: ' + info.limit + '\nTime to limit end: ' + info.timeout);
});
client.on("warn", (info) => console.log(info));

process.on("unhandledRejection", console.error);
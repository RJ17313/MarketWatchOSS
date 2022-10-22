import { Client, GatewayIntentBits, Collection } from 'discord.js';
import path from 'node:path';
import { getFileList } from '../utils/getFiles.js';
import * as url from 'url';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandFiles = getFileList('src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(url.fileURLToPath(new URL('.', import.meta.url)), '../..', file);
	const command = (await import(filePath)).default;
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log(`${client.user.username} connected!`);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(process.env.TOKEN);
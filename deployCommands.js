import path from 'node:path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';
import { getFileList } from './src/utils/getFiles.js';
import 'dotenv/config'
import * as url from 'url';

const commands = [];

const files = getFileList('src/commands').filter(file => file.endsWith('.js'));
for (const commandsPath of files) {
	const filePath = path.join(url.fileURLToPath(new URL('.', import.meta.url)), commandsPath);
	const command = (await import(filePath)).default;
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
	.then(data => console.log(`Successfully registered ${data.length} application coammnds.`))
	.catch(console.error);
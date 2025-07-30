const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const commands = [
  new SlashCommandBuilder()
    .setName('gato')
    .setDescription('Muestra un gato random'),
  new SlashCommandBuilder()
    .setName('siono')
    .setDescription('Responde sí o no al azar')
    .addStringOption(option => 
      option.setName('pregunta')
        .setDescription('Tu pregunta')
        .setRequired(true)
    ),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Registrando comandos slash...');

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log('Comandos registrados correctamente.');
  } catch (error) {
    console.error('Error al registrar comandos:', error);
  }
})();

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { Client, GatewayIntentBits, Events, Partials } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');

require('dotenv').config();
const token = process.env.DISCORD_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

const PREFIX = 'mb!';
const AUDIO_FOLDER = path.join(__dirname, 'assets');

client.once('ready', () => {
    console.log(`Bot ready, connected as ${client.user.tag}`);
    client.user.setActivity('League Of Legends as Master Yi', { type: 'PLAYING' });
});

// --- Slash commands
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    //Slash gato
    if (commandName === 'gato') {
        try {
            const response = await fetch('https://api.thecatapi.com/v1/images/search');
            if (!response.ok) throw new Error('No se pudo obtener la imagen');

            const data = await response.json();
            const catImageUrl = data[0].url;

            await interaction.reply({
                content: '😺 Mira loko un gatubi random',
                files: [catImageUrl],
            });
        } catch (error) {
            console.error('Error al obtener imagen de gato (slash):', error);
            await interaction.reply('Ocurrió un error al obtener la imagen del gato.');
        }
    }

    //Slash siono + pregunta
    if (commandName === 'siono') {
        const pregunta = interaction.options.getString('pregunta');
        const respuesta = Math.random() < 0.5 ? 'Sí 😈' : 'No ☠️';
        await interaction.reply(`Pregunta: "${pregunta}"\nRespuesta: ${respuesta}`);
    }
});


// --- Prefix commands
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const command = message.content.slice(PREFIX.length).trim().toLowerCase();

    //Comando "gato" muestra un gato random
    if (command === 'gato') {
        try {
            const response = await fetch('https://api.thecatapi.com/v1/images/search');
            if (!response.ok) throw new Error('No se pudo obtener la imagen');

            const data = await response.json();
            const catImageUrl = data[0].url;

            await message.channel.send({
                content: '😺 Mira loko un gatubi random',
                files: [catImageUrl],
            });
        } catch (error) {
            console.error('Error al obtener imagen de gato:', error);
            await message.reply('Ocurrió un error al obtener la imagen del gato.');
        }
        return;
    }

    // Comando "siono"
    if (command === 'siono') {
        const respuesta = Math.random() < 0.5 ? 'Sí 😈' : 'No ☠️';
        return message.reply(`${respuesta}`);
    }


    if (command === 'comandos') {   //Listar sonidos disponibles
        // Leer archivos de audio
        const files = fs.readdirSync(AUDIO_FOLDER);
        const commands = files
            .filter(file => file.endsWith('.ogg') && file !== 'default.ogg')
            .map(file => file.replace('.ogg', ''));

        if (commands.length === 0) {
            return message.reply('No hay audios disponibles.');
        }

        const reply = `😈 Audios disponibles:\n\`${commands.join('`, `')}\` (Ejm: m!dios)`;
        return message.reply(reply);
    }

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {  //Usuario no esta en canal de voz
        return message.reply('Debes estar en un canal de voz para usar este comando.');
    }


    //Caso valido
    let audioPath = path.join(AUDIO_FOLDER, `${command}.ogg`);
    let isDefault = false;

    if (!fs.existsSync(audioPath)) {
        audioPath = path.join(AUDIO_FOLDER, 'default.ogg');
        isDefault = true;
    }

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(audioPath);

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
    });

    player.on('error', error => {
        console.error(`Error al reproducir audio: ${error.message}`);
        connection.destroy();
    });

    message.react(isDefault ? '❓' : '😎');
});

client.login(token);
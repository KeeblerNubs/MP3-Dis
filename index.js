require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const https = require('https');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const PREFIX = '!play';
const PLACEHOLDER_TOKENS = new Set(['', 'YOUR_BOT_TOKEN_HERE']);

function getDiscordToken() {
    const token = (process.env.DISCORD_TOKEN || '').trim();

    if (PLACEHOLDER_TOKENS.has(token)) {
        console.error('Missing or invalid DISCORD_TOKEN. Set a real bot token in your .env file before starting the bot.');
        process.exit(1);
    }

    return token;
}

client.once('ready', () => {
    console.log(`Bot is online as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    // Check if the user is in a voice channel
    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel) {
        return message.reply('You need to be in a voice channel to play music!');
    }

    // Check for MP3 attachment
    const attachment = message.attachments.first();
    if (!attachment || !attachment.name.endsWith('.mp3')) {
        return message.reply('Please attach an .mp3 file with the command!');
    }

    const loadingMessage = await message.reply('Downloading and preparing your audio...');

    // Setup local file path
    const downloadsDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);
    const filePath = path.join(downloadsDir, `${Date.now()}_${attachment.name}`);

    // Download the file
    const file = fs.createWriteStream(filePath);
    https.get(attachment.url, (response) => {
        response.pipe(file);
        file.on('finish', async () => {
            file.close();
            await loadingMessage.edit('Playing audio now!');
            playAudio(voiceChannel, filePath, message);
        });
    }).on('error', async (err) => {
        fs.unlink(filePath, () => {});
        await loadingMessage.edit('Failed to download the MP3 file.');
        console.error(err);
    });
});

function playAudio(voiceChannel, filePath, message) {
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(filePath);

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
        // Clean up the file after playing
        fs.unlink(filePath, (err) => {
            if (err) console.error('Failed to delete temporary file:', err);
        });
    });

    player.on('error', error => {
        console.error(`Error: ${error.message}`);
        connection.destroy();
        fs.unlink(filePath, () => {});
    });
}

client.login(getDiscordToken());

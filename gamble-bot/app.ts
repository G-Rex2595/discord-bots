import { Client, Message } from 'discord.js'
import { CurrencyService } from './currency/currency.service';
import { StorageService } from './storage/storage.service';

const client = new Client();
let userId: string;

const OWNER = process.env.OWNER || '';

const config = require('./config/config.json');

const storageService = new StorageService(config.storageLocation, client);
const currencyService = new CurrencyService(storageService, client);

client.on('ready', () => {
    console.log('Bot ready');
    userId = client.user && client.user.id ? client.user.id : '';
});

client.on('message', msg => {
    if (msg.content === 'my balance') {
        if (!msg.guild || !msg.member) {
            return;
        }
        const rewards = currencyService.getRewards(msg.guild, msg.member);
        msg.reply(`your balance is ${rewards} stakes`);
    } else if (msg.content === 'bot save' && msg.member && msg.member.id === OWNER) {
        currencyService.storeRewards().then(val => {
            msg.reply('all currencies saved');
        });
    }
});

client.on('guildCreate', (guild) => {
    currencyService.addGuild(guild);
    console.log('Joined guild', guild.name);
})

client.login(process.env.BOT_TOKEN);

function stop() {
    currencyService.storeRewards().then(() => {
        client.users.fetch(OWNER)
            .then(owner => owner.send('Rewards stored. Bot shutting down'))
            .then(() => process.exit());
    });
}

process.on('SIGINT', stop);

process.on('SIGTERM', stop);
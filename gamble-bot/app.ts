import { Client, Message, TextChannel } from 'discord.js'
import { CurrencyService } from './currency/currency.service';
import { StorageService } from './storage/storage.service';

const client = new Client();
let userId: string;

const OWNER = process.env.OWNER || '';
const ENVIRONMENT = process.env.ENVIRONMENT ? process.env.ENVIRONMENT.toLocaleLowerCase() : process.exit();
const IS_LIVE = ENVIRONMENT === 'live';

const config = require('./config/config.json');

const storageService = new StorageService(config.storageLocation, client);
const currencyService = new CurrencyService(storageService, client);

client.on('ready', () => {
    console.log('Bot ready');
    if (config.sendStartupMessage) {
        client.users.fetch(OWNER).then(owner => {
            owner.send("Bot has started");
        });
    }
    userId = client.user && client.user.id ? client.user.id : '';
});

client.on('message', msg => {
    let content = msg.content.toLocaleLowerCase();
    if (!IS_LIVE) {
        if (content.startsWith(ENVIRONMENT)) {
            content = content.substring(ENVIRONMENT.length + 1);
        } else {
            return;
        }
    }
    if ('my balance'.localeCompare(content) === 0) {
        if (!msg.guild || !msg.member) {
            return;
        }
        const rewards = currencyService.getRewards(msg.guild, msg.member);
        msg.reply(`your balance is ${rewards} stakes`);
    } else if ('bot save'.localeCompare(content) === 0 && msg.member && msg.member.id === OWNER) {
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
        return client.users.fetch(OWNER)
            .then(owner => {
                if (config.sendExitMessage) {
                    return owner.send('Rewards stored. Bot shutting down');
                } else {
                    return null;
                }
            })
    })
        .then(() => process.exit());
}

process.once('SIGINT', stop);

process.once('SIGTERM', stop);
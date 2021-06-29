import { Client, Guild, GuildMember, TextChannel, VoiceChannel } from "discord.js";
import { StorageService } from "../storage/storage.service";

export class CurrencyService {
    private guildCurrencies: Map<string, Map<string, number>> = new Map<string, Map<string, number>>();

    constructor(private storageService: StorageService, private client: Client) {
        storageService.loadGuildCurrencies().then(val => {
            this.guildCurrencies = val;
        });
        this.startRewarding();
    }

    startRewarding() {
        setInterval(() => {
            this.reward();
        }, 5 * 60 * 1000);
        setInterval(() => {
            this.storeRewards();
        }, 60 * 60 * 1000);
    }

    reward() {
        this.guildCurrencies.forEach((memberCurrencies, guildId) => {
            const guild = this.client.guilds.cache.get(guildId);
            if (guild) {
                const rewardMembers = new Array<string>();

                guild.channels.cache.forEach((channel, channelId) => {
                    if (channel instanceof VoiceChannel) {
                        channel.members.forEach((member, memberId) => {
                            if (!rewardMembers.includes(memberId)) {
                                rewardMembers.push(memberId);
                            }
                        });
                    } else if (channel instanceof TextChannel) {
                        channel.messages.cache.forEach((message, messageId) => {
                            if (message.member && Date.now() - message.createdTimestamp < 5 * 60 * 1000) {
                                if (!rewardMembers.includes(message.member.id) && (this.client.user && message.member.id != this.client.user.id)) {
                                    rewardMembers.push(message.member.id);
                                }
                            }
                        })
                    }
                });

                rewardMembers.forEach(memberId => {
                    let currentRewards = memberCurrencies.get(memberId);
                    if (currentRewards) {
                        currentRewards += 10;
                    } else {
                        currentRewards = 10;
                    }
                    memberCurrencies.set(memberId, currentRewards);
                })
            }
        })
    }

    storeRewards(): Promise<void[]> {
        const promises = new Array<Promise<void>>();
        this.guildCurrencies.forEach((memberCurrencies, guildId) => {
            promises.push(this.storageService.store(guildId, memberCurrencies));
        })
        return Promise.all(promises)
    }

    addGuild(guild: Guild) {
        if (!this.guildCurrencies.get(guild.id)) {
            this.guildCurrencies.set(guild.id, new Map<string, number>());
        }
    }

    getRewards(guild: Guild, member: GuildMember): number {
        const memberCurrencies = this.guildCurrencies.get(guild.id);
        if (memberCurrencies) {
            return memberCurrencies.get(member.id) || 0;
        }
        return 0;
    }
};
import { randomUUID } from "crypto";
import { Client, Guild, GuildMember } from "discord.js";
import { writeFile, readFile, readdir } from "fs/promises";

export class StorageService {
    constructor(private storageLocation: string, private client: Client) { };

    store(guild: string, currencies: Map<string, number>): Promise<void> {
        return writeFile(`${this.storageLocation}/${guild}.json`, JSON.stringify([...currencies]))
            .catch(err => {
                console.error('could not store currencies', err);
            })
    }

    async loadGuildCurrencies(): Promise<Map<string, Map<string, number>>> {
        return this.getGuildFiles().then((files: Array<string>) => {
            const promises = new Array<Promise<Map<string, Map<string, number>>>>();

            files.forEach(file => {
                const guildId = file.substring(0, file.length - 5);
                const guildCurrency = new Map<string, Map<string, number>>();
                promises.push(
                    readFile(`${this.storageLocation}/${file}`, 'utf8').then(data => {
                        let memberCurrency
                        try {
                            memberCurrency = new Map<string, number>(JSON.parse(data));
                        } catch (error) {
                            console.error('Parse error:', data, '\n', error);
                            memberCurrency = new Map<string, number>();
                        }
                        guildCurrency.set(guildId, memberCurrency);
                        return (guildCurrency);
                    }).catch(err => {
                        console.error(err);
                        return (guildCurrency);
                    })
                );
            });

            return Promise.all(promises).then(values => {
                const guildCurrencies = new Map<string, Map<string, number>>();

                values.forEach((guildCurrency) => {
                    guildCurrency.forEach((memberCurrencies, guildId) => {
                        guildCurrencies.set(guildId, memberCurrencies);
                    })
                });

                return (guildCurrencies);
            });
        });
    }

    getGuildFiles(): Promise<Array<string>> {
        const guildFiles = new Array<string>();
        return readdir(`${this.storageLocation}/`).then(files => {
            files.forEach((file: string) => {
                if (file.includes('.json')) {
                    guildFiles.push(file);
                }
            });
            return guildFiles;
        }).catch(err => {
            console.error(err);
            return guildFiles;
        });
    }
}
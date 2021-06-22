import { Client, Collection, Guild, Role, GuildMember } from 'discord.js';

const client = new Client();

const BLOCKED_ROLES_TOKEN = process.env.BLOCKED_ROLES || '[]';
const BLOCKED_ROLES = JSON.parse(BLOCKED_ROLES_TOKEN);

export class RolesService {
    getRoles(guild: Guild): Collection<string, Role> {
        return guild.roles.cache;
    }

    addRole(guild: Guild, role: string, member: GuildMember) {
        if (!BLOCKED_ROLES.includes(role)) {
            guild.roles.create({
                data: {
                    name: role,
                    mentionable: true
                },
                reason: 'Role was @ed but did not exist'
            }).then(role => {
                member.roles.add(role).catch(err => console.error('could not add user to role', err));
            }).catch(err => {
                console.error('Could not create role.', err);
            });
        }
    }

    addRoles(guild: Guild, roles: Array<string>, member: GuildMember) {
        roles.forEach(role => {
            this.addRole(guild, role, member);
        })
    }

    addMemberToRole(guild: Guild, role: string, member: GuildMember) {
        const roles = this.getRoles(guild);
        let roleExists = false;

        roles.forEach((val, key) => {
            if (key.localeCompare(role) === 0 || val.name.localeCompare(role) === 0) {
                roleExists = true;
                member.roles.add(val).catch(err => {
                    console.error('could not add user to role.', err);
                });
            }
        })

        if (!roleExists) {
            this.addRole(guild, role, member);
        }
    }

    addMemberToRoles(guild: Guild, roles: Array<string>, member: GuildMember) {
        roles.forEach(role => {
            this.addMemberToRole(guild, role, member);
        })
    }

    removeMemberFromRole(guild: Guild, roleID: string, member: GuildMember) {
        const roles = this.getRoles(guild);

        const role = roles.get(roleID);
        if (role) {
            member.roles.remove(role).catch(err => {
                console.log('Failed to remove user from role');
            });

            let shouldBeDeleted = false;
            if(role.members.size === 0) {
                shouldBeDeleted = true;
            }
            if(role.members.size === 1) {
                const roleMember = role.members.first();
                shouldBeDeleted = !roleMember || roleMember.id.localeCompare(member.id) === 0;
            }
            
            if (shouldBeDeleted) {
                role.delete('No more members in this role');
            }
        }
    }

    removeMemberFromRoles(guild: Guild, roles: Array<string>, member: GuildMember) {
        roles.forEach(role => {
            this.removeMemberFromRole(guild, role, member);
        })
    }
};
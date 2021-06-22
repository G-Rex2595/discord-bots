import { Client } from 'discord.js';
import { RolesService } from './roles/roles.service';

const client = new Client();
const rolesService = new RolesService();
let userId: string;

client.on('ready', () => {
    console.log('Bot ready');
    userId = client.user && client.user.id ? client.user.id : '';
})

client.on('message', msg => {
    if (msg.mentions && msg.mentions.users && msg.mentions.users.has(userId) && msg.content.includes('help')) {
        msg.reply('I\'m the role relegator bot. I help manage roles for this server. If you @ a role that doesn\'t exist, I can create it and add you to it. If you want to be added to or removed from an existing role, see the following commands.\n\
```    /addme [roles]    - adds you to existing roles or creates new roles and adds you to them\n\
    /removeme [roles] - removes you from any existing roles you are currently part of\n```\
Some roles are blocked, so don\'t bother trying to add yourself to them. Only a user with permissions to modify roles will be allowed to add you to those roles.');
        return;
    }

    const guild = msg.guild;
    const member = msg.member;
    if (guild == null || member == null) {
        return;
    }

    const content = msg.content;
    console.log(content);

    //get the ats
    const ats = content.match(/(?<=( |^)@)[^ ]+/g);
    console.log('found @s', ats);
    let existingRoles = new Array<string>();
    msg.mentions.roles.forEach((val, key) => {
        existingRoles.push(key);
    });
    console.log('Existing roles', existingRoles);

    if (content.startsWith('/addme')) {
        if (ats === null && existingRoles === null) {
            return;
        }

        const roles = new Array<string>();
        if (!(ats === null || ats.length === 0)) {
            ats.forEach(at => roles.push(at));
        }
        if (!(existingRoles === null || existingRoles.length === 0)) {
            existingRoles.forEach(role => roles.push(role));
        }

        rolesService.addMemberToRoles(guild, roles, member);
    } else if (content.startsWith('/removeme')) {
        if (!existingRoles || existingRoles.length === 0) {
            return;
        }

        rolesService.removeMemberFromRoles(guild, existingRoles, member);
    } else if (ats && ats.length > 0 && !msg.author.bot) {
        //get the roles
        const roles = rolesService.getRoles(guild);
        const roleNames = new Array<string>();
        roles.forEach((val, key) => {
            roleNames.push(val.name);
        })
        console.log(roleNames);

        //find the roles that haven't been created, yet
        const uncreatedRoles = new Array<string>();
        ats.forEach(at => {
            if (!roleNames.includes(at)) {
                uncreatedRoles.push(at);
            }
        })
        console.log(uncreatedRoles);

        rolesService.addRoles(guild, uncreatedRoles, member)
    }
})

client.login(process.env.BOT_TOKEN);
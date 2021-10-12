import { GuildMember, Message, Role } from 'discord.js';
import DiscordCommand from './Command';

export default class PromoteOfficial extends DiscordCommand {
  static alias = 'po';

  async execute(msg: Message): Promise<Message | Message[]> {
    const author = this.author(msg);
    const authorOfficerRolesNames = this.officerRolesNames(author);
    if (!authorOfficerRolesNames.length) {
      const embed = this.createErrorEmbed({ title: 'Error', description: 'No eres oficial de ningún gremio.' });
      msg.channel.send({ embed });
      return;
    }

    const targetGuildRoles: Role[] = Array.from(msg.mentions.roles.values());
    if (targetGuildRoles.length > 1) {
      const embed = this.createErrorEmbed({ title: 'Error', description: 'Sólo puedes hacer oficial en un gremio a la vez.' });
      msg.channel.send({ embed });
      return;
    }

    const members: GuildMember[] = Array.from(msg.mentions.members.values());
    if (!members.length) {
      const embed = this.createErrorEmbed({ title: 'Error', description: 'Indique los miembros a ascender.' });
      msg.channel.send({ embed });
      return;
    }

    const targetGuildRole: Role = targetGuildRoles[0];
    const officerRole: Role = DiscordCommand.guildOfficerRoleNameByGuildRole[targetGuildRole.name];

    const role = msg.guild.roles.cache.find((role: Role) => role.name === officerRole.toString());

    const fields = [];
    for (const member of members) {
      try {
        const nickname = member.nickname;
        if (nickname.slice(-1) !== '☆') {
          await member.setNickname(nickname + ' ☆');
        }
        await member.roles.add(role);
      } catch (e) {
        console.error(e);
      }

      const name = member.displayName;
      const value = 'Añadido a ' + officerRole.name;

      fields.push({ name, value });
    }

    const embed = this.createEmbed({
      title: 'Promocionar oficiales',
      description: 'Usuarios promocionados',
      fields,
    });

    try {
      await Promise.all([
        msg.channel.send({ embed }),
        ...members.map((member: GuildMember) => member.send('Has sido promocionado a oficial en ' + targetGuildRole.name)),
      ]);

    } catch (e) {
      console.log(e);
    }
  }
}

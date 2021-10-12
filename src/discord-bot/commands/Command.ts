import { GuildMember, Message, Role, User } from 'discord.js';
import Roles from '../domain/roles';

export default abstract class DiscordCommand {
  static officerRolesNames = [
    Roles.OfficerVortice.toString(),
    Roles.OfficerJuicio.toString(),
    Roles.OfficerGuardianes.toString(),
    Roles.OfficerHardTeam.toString(),
    Roles.OfficerLegado.toString(),
    Roles.OfficerSoldados.toString(),
    Roles.OfficerDragones.toString(),
  ];

  static guildRoleNameByOfficerRole = {
    [Roles.OfficerVortice]: Roles.Vortice,
    [Roles.OfficerJuicio]: Roles.Juicio,
    [Roles.OfficerGuardianes]: Roles.Guardianes,
    [Roles.OfficerHardTeam]: Roles.HardTeam,
    [Roles.OfficerLegado]: Roles.Legado,
    [Roles.OfficerSoldados]: Roles.Soldados,
    [Roles.OfficerDragones]: Roles.Dragones,
  };

  static guildOfficerRoleNameByGuildRole = {
    [Roles.Vortice]: Roles.OfficerVortice,
    [Roles.Juicio]: Roles.OfficerJuicio,
    [Roles.Guardianes]: Roles.OfficerGuardianes,
    [Roles.HardTeam]: Roles.OfficerHardTeam,
    [Roles.Legado]: Roles.OfficerLegado,
    [Roles.Soldados]: Roles.OfficerSoldados,
    [Roles.Dragones]: Roles.OfficerDragones,
  };

  static alias: string;

  abstract execute(msg: Message): Promise<Message | Message[]>;

  protected author(msg: Message): GuildMember {
    return msg.guild.member(msg.author);
  }

  protected officerRolesNames(member: GuildMember) {
    return this
      .getRolesNames(member)
      .filter(
        (roleName: string) => {
          return DiscordCommand.officerRolesNames.includes(roleName);
        },
      );
  }

  protected getRolesNames(member: GuildMember) {
    return member.roles.cache.map((role: Role) => role.name);
  }

  protected createErrorEmbed({ title, description }) {
    return this.createEmbed({ title, description, color: 0xdf342a });
  }

  protected createEmbed({ title = '', description, color = 3447003, fields = [] }) {
    return { color, title, description, fields, timestamp: new Date(), footer: { text: '© Comunidad Vórtice' } };
  }
}

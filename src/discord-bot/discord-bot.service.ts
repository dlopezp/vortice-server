import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Discord from 'discord.js';
import { Client, Message, Role, GuildMember, TextChannel } from 'discord.js';

enum Command {
  Help = 'help',
  ListBackup = 'lr',
  AddBackup = 'ar',
  RemoveBackup = 'rr',
}

enum Roles {
  Reserva = 'Reserva',
  OfficerVortice = 'Oficial Vórtice',
  OfficerJuicio = 'Oficial Juicio',
  OfficerGuardianes = 'Oficial Guardianes',
  OfficerHardTeam = 'Oficial Hard Team',
  OfficerLegado = 'Oficial Legado',
  OfficerSoldados = 'Oficial Soldados',
  OfficerDragones = 'Oficial Dragones',
  Vortice = 'Vórtice',
  Juicio = 'Juicio',
  Guardianes = 'Guardianes',
  HardTeam = 'Hard Team',
  Legado = 'Legado',
  Soldados = 'Soldados',
  Dragones = 'Dragones',
}

const officerRolesNames = [
  Roles.OfficerVortice.toString(),
  Roles.OfficerJuicio.toString(),
  Roles.OfficerGuardianes.toString(),
  Roles.OfficerHardTeam.toString(),
  Roles.OfficerLegado.toString(),
  Roles.OfficerSoldados.toString(),
  Roles.OfficerDragones.toString(),
];

const guildRoleNameByOfficerRole = {
  [Roles.OfficerVortice]: Roles.Vortice,
  [Roles.OfficerJuicio]: Roles.Juicio,
  [Roles.OfficerGuardianes]: Roles.Guardianes,
  [Roles.OfficerHardTeam]: Roles.HardTeam,
  [Roles.OfficerLegado]: Roles.Legado,
  [Roles.OfficerSoldados]: Roles.Soldados,
  [Roles.OfficerDragones]: Roles.Dragones,
};

@Injectable()
export class DiscordBotService {
  private static PREFIX: string = 'vv';
  private bot: Client;
  private discordBotToken: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.discordBotToken = configService.get<string>('DISCORD_BOT_TOKEN');
    this.createBot();
    this.initBot();
  }

  init() {}

  private createBot() {
    this.bot = new Discord.Client();
    this.bot.login(this.discordBotToken);
  }

  private initBot() {
    this.bot.on('ready', () => {
      console.info(`Logged in as ${this.bot.user.tag}!`);
    });

    this.bot.on('message', this.onMessage());
  }

  private onMessage() {
    return async (msg: Message) => {
      const content = msg.content;
      if (!content.startsWith(DiscordBotService.PREFIX)) {
        console.log('Discard message', content);
        return;
      }

      console.log('Proccess message', content);
      msg.react('🤔');

      const command = this.getCommand(content);
      console.log(command);
      const handler = this.getHandler(command);
      await handler(msg);
      await msg.react('👌');
    };
  }

  private getCommand(content: string) {
    return content.split(' ')[0].substring(3);
  }

  private getHandler(command: string) {
    const commandMap = {
      [Command.Help]: this.showHelp(),
      [Command.ListBackup]: this.listBackup(),
      [Command.AddBackup]: this.addBackup(),
      [Command.RemoveBackup]: this.removeBackup(),
    };

    const handler = commandMap[command] || this.commandNotFound;
    return handler;
  }

  private commandNotFound(msg: Message) {
    msg.reply('Command not found');
  }

  private showHelp() {
    return (msg: Message) => {
      msg.reply('showHelp');
    }
  }

  private listBackup() {
    return (msg: Message) => {
      const authorOfficerRolesNames = this.officerRolesNames(msg.member);
      if (!authorOfficerRolesNames.length) {
        const embed = this.createErrorEmbed({ title: 'Error', description: 'No eres oficial de ningún gremio.' });
        msg.channel.send({ embed });
        return;
      }

      const fields = authorOfficerRolesNames.map(
        (officerRoleName: string) => {
          const guildRoleName = guildRoleNameByOfficerRole[officerRoleName];
          const channel: TextChannel = msg.channel as TextChannel;
          const members = channel.members;
          const backupMembers = members.filter(
            (member: GuildMember) => {
              const memberRolesNames = this.getRolesNames(member);
              const isBackup = memberRolesNames.includes(Roles.Reserva);
              const isGuildMember = memberRolesNames.includes(guildRoleName) || memberRolesNames.includes(officerRoleName);

              return isBackup && isGuildMember;
            }
          );
          const value = backupMembers.map((member: GuildMember) => member.nickname).join('\n');

          return { name: guildRoleName, value  };
        },
      );

      const embed = this.createEmbed({
        title: 'Listado de Reserva',
        description: 'Este es el listado de miembros con el rol de @Reserva de los gremios de los que eres oficial',
        fields,
      });
      msg.channel.send({ embed });
    };
  }

  private addBackup() {
    return async (msg: Message) => {
      const authorOfficerRolesNames = this.officerRolesNames(msg.member);
      if (!authorOfficerRolesNames.length) {
        const embed = this.createErrorEmbed({ title: 'Error', description: 'No eres oficial de ningún gremio.' });
        await msg.channel.send({ embed });
        return;
      }

      const backupRole = msg.guild.roles.find( (role: Role) => role.name === Roles.Reserva );

      const membersRolesNames = []
        .concat(authorOfficerRolesNames)
        .concat(authorOfficerRolesNames.map(officerRoleName => guildRoleNameByOfficerRole[officerRoleName]));

      const fields = [];
      for (const member of msg.mentions.members.values()) {
        const memberRolesNames = member.roles.map((role: Role) => role.name);
        const authorIsOfficerOfMember = memberRolesNames.some(memberRoleName => membersRolesNames.includes(memberRoleName));
        const isBackup = memberRolesNames.includes(Roles.Reserva);

        if (authorIsOfficerOfMember && !isBackup) {
          try {
            await member.addRole(backupRole);
          } catch (e) {
            console.error(e);
          }
        }

        const name = member.nickname;
        const value = !authorIsOfficerOfMember
          ? 'No pertenece a tu gremio'
            : isBackup
              ? 'Ya tiene el rol de Reserva'
              : 'Rol de reserva añadido';

        fields.push({ name, value });
      }

      const embed = this.createEmbed({
        title: 'Eliminar rol de Reserva',
        description: 'Este es el listado de miembros con el rol de @Reserva de los gremios de los que eres oficial',
        fields,
      });
      try {
        await msg.channel.send({ embed });
      } catch (e) {
        console.log(e);
      }
    }
  }

  private removeBackup() {
    return async (msg: Message) => {
      const authorOfficerRolesNames = this.officerRolesNames(msg.member);
      if (!authorOfficerRolesNames.length) {
        const embed = this.createErrorEmbed({ title: 'Error', description: 'No eres oficial de ningún gremio.' });
        await msg.channel.send({ embed });
        return;
      }

      const backupRole = msg.guild.roles.find( (role: Role) => role.name === Roles.Reserva );

      const membersRolesNames = []
        .concat(authorOfficerRolesNames)
        .concat(authorOfficerRolesNames.map(officerRoleName => guildRoleNameByOfficerRole[officerRoleName]));

      const fields = [];
      for (const member of msg.mentions.members.values()) {
        const memberRolesNames = member.roles.map((role: Role) => role.name);
        const authorIsOfficerOfMember = memberRolesNames.some(memberRoleName => membersRolesNames.includes(memberRoleName));
        const isBackup = memberRolesNames.includes(Roles.Reserva);

        if (authorIsOfficerOfMember && isBackup) {
          try {
            await member.removeRole(backupRole);
          } catch (e) {
            console.error(e);
          }
        }

        const name = member.nickname;
        const value = !authorIsOfficerOfMember
          ? 'No pertenece a tu gremio'
            : !isBackup
              ? 'No tiene el rol de Reserva'
              : 'Rol de reserva eliminado';

        fields.push({ name, value });
      }

      const embed = this.createEmbed({
        title: 'Eliminar rol de Reserva',
        description: 'Este es el listado de miembros con el rol de @Reserva de los gremios de los que eres oficial',
        fields,
      });
      try {
        await msg.channel.send({ embed });
      } catch (e) {
        console.log(e);
      }
    }
  }

  private officerRolesNames(member: GuildMember) {
    return this
      .getRolesNames(member)
      .filter(
        (roleName: string) => {
          return officerRolesNames.includes(roleName);
        },
      );
  }

  private getRolesNames(member: GuildMember) {
    return member.roles.map((role: Role) => role.name);
  }

  private createErrorEmbed({ title, description }) {
    return this.createEmbed({ title, description, color: 0xdf342a });
  }

  private createEmbed({ title, description, color = 3447003, fields = [] }) {
    return { color, title, description, fields, timestamp: new Date(), footer: { text: '© Comunidad Vórtice' } };
  }
}
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Discord from 'discord.js';
import { Client, Message, Role, GuildMember, TextChannel, Intents } from 'discord.js';
import DiscordCommand from './commands/Command';
import PromoteOfficial from './commands/PromoteOfficial';

enum Command {
  Help = 'help',
  ListBackup = 'lr',
  AddBackup = 'ar',
  RemoveBackup = 'rr',
  AddToGuild = 'ag',
  RemoveFromGuild = 'rg',
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
  private static PREFIX: string = 'cv';
  private bot: Client;
  private discordBotToken: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.discordBotToken = configService.get<string>('DISCORD_BOT_TOKEN');
    this.createBot();
    this.initBot();
  }

  init() { }

  private createBot() {
    const intents = new Intents([
      Intents.NON_PRIVILEGED, // include all non-privileged intents, would be better to specify which ones you actually need
      "GUILD_MEMBERS", // lets you request guild members (i.e. fixes the issue)
    ]);
    // this.bot = new Discord.Client();
    this.bot = new Discord.Client({ ws: { intents } });
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
      const prefix = content.split('.')[0].toLowerCase();
      if (prefix !== DiscordBotService.PREFIX) {
        console.log('Discard message', content);
        return;
      }

      console.log('Proccess message', content);
      await msg.react('🤔');

      const command = this.getCommand(content);
      console.log(command);
      const handler = this.getHandler(command);
      if (handler instanceof DiscordCommand) {
        await handler.execute(msg);
      } else {
        await handler(msg);
      }
      await msg.react('👌');
    };
  }

  private getCommand(content: string) {
    return content.split(' ')[0].substring(3).toLowerCase();
  }

  private getHandler(command: string) {
    const commandMap = {
      [Command.Help]: this.showHelp(),
      [Command.ListBackup]: this.listBackup(),
      [Command.AddBackup]: this.addBackup(),
      [Command.RemoveBackup]: this.removeBackup(),
      [Command.AddToGuild]: this.addToGuild(),
      [Command.RemoveFromGuild]: this.removeFromGuild(),
      [PromoteOfficial.alias]: new PromoteOfficial(),
    };

    const handler = commandMap[command] || this.commandNotFound();
    return handler;
  }

  private commandNotFound() {
    return async (msg: Message) => {
      const embed = this.createEmbed({ description: 'No se encuentra el comando' });
      try {
        await msg.channel.send({ embed });
      } catch (e) {
        console.log(e);
      }
    };
  }

  private showHelp() {
    return async (msg: Message) => {
      const embed = this.createEmbed({
        title: 'Listado de comandos',
        description: 'Este es el listado de comandos disponibles.',
        fields: [
          {
            "name": "cv.help",
            "value": "Muestra la ayuda"
          },
          {
            "name": "cv.ag",
            "value": "Añade el rol de gremio"
          },
          {
            "name": "cv.rg",
            "value": "Retira el rol de gremio"
          },
          {
            "name": "cv.po",
            "value": "Promociona a oficial en el gremio"
          },
          {
            "name": "cv.do",
            "value": "Degrada a un oficial en el gremio"
          },
          {
            "name": "cv.lr",
            "value": "Muestra el listado de reservas de tu gremio"
          },
          {
            "name": "cv.ar",
            "value": "Añade reservas"
          },
          {
            "name": "cv.rr",
            "value": "Retira reservas"
          },
        ],
      });
      try {
        await msg.channel.send({ embed });
      } catch (e) {
        console.log(e);
      }
    };
  }

  private listBackup() {
    return async (msg: Message) => {
      const guild = msg.guild;
      const members = await guild.members.fetch();
      const member = await guild.members.fetch(msg.author.id);
      const authorOfficerRolesNames = this.officerRolesNames(member);
      if (!authorOfficerRolesNames.length) {
        const embed = this.createErrorEmbed({ title: 'Error', description: 'No eres oficial de ningún gremio.' });
        msg.channel.send({ embed });
        return;
      }
      const fields = authorOfficerRolesNames.map(
        (officerRoleName: string) => {
          const guildRoleName = guildRoleNameByOfficerRole[officerRoleName];
          const backupMembers = members.filter(
            (member: GuildMember) => {
              const memberRolesNames = this.getRolesNames(member);
              const isBackup = memberRolesNames.includes(Roles.Reserva);
              const isGuildMember = memberRolesNames.includes(guildRoleName) || memberRolesNames.includes(officerRoleName);

              return isBackup && isGuildMember;
            }
          );
          const value = backupMembers.map((member: GuildMember) => member.displayName).join('\n');

          return { name: guildRoleName, value };
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
      const guild = msg.guild;
      const members = await guild.members.fetch();
      const member = await guild.members.fetch(msg.author.id);
      const authorOfficerRolesNames = this.officerRolesNames(member);

      if (!authorOfficerRolesNames.length) {
        const embed = this.createErrorEmbed({ title: 'Error', description: 'No eres oficial de ningún gremio.' });
        await msg.channel.send({ embed });
        return;
      }

      const backupRole = msg.guild.roles.cache.find((role: Role) => role.name === Roles.Reserva);

      const membersRolesNames = []
        .concat(authorOfficerRolesNames)
        .concat(authorOfficerRolesNames.map(officerRoleName => guildRoleNameByOfficerRole[officerRoleName]));

      const fields = [];
      for (const member of msg.mentions.members.values()) {
        const memberRolesNames = member.roles.cache.map((role: Role) => role.name);
        const authorIsOfficerOfMember = memberRolesNames.some(memberRoleName => membersRolesNames.includes(memberRoleName));
        const isBackup = memberRolesNames.includes(Roles.Reserva);

        if (authorIsOfficerOfMember && !isBackup) {
          try {
            await member.roles.add(backupRole);
          } catch (e) {
            console.error(e);
          }
        }

        const name = member.displayName;
        const value = !authorIsOfficerOfMember
          ? 'No pertenece a tu gremio'
          : isBackup
            ? 'Ya tiene el rol de Reserva'
            : 'Rol de reserva añadido';

        fields.push({ name, value });
      }

      const embed = this.createEmbed({
        title: 'Añadir rol de Reserva',
        description: 'Añade el rol de Reserva a los miembros mencionados',
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
      const guild = msg.guild;
      const members = await guild.members.fetch();
      const member = await guild.members.fetch(msg.author.id);
      const authorOfficerRolesNames = this.officerRolesNames(member);
      if (!authorOfficerRolesNames.length) {
        const embed = this.createErrorEmbed({ title: 'Error', description: 'No eres oficial de ningún gremio.' });
        await msg.channel.send({ embed });
        return;
      }

      const backupRole = msg.guild.roles.cache.find((role: Role) => role.name === Roles.Reserva);

      const membersRolesNames = []
        .concat(authorOfficerRolesNames)
        .concat(authorOfficerRolesNames.map(officerRoleName => guildRoleNameByOfficerRole[officerRoleName]));

      const fields = [];
      for (const member of msg.mentions.members.values()) {
        const memberRolesNames = member.roles.cache.map((role: Role) => role.name);
        const authorIsOfficerOfMember = memberRolesNames.some(memberRoleName => membersRolesNames.includes(memberRoleName));
        const isBackup = memberRolesNames.includes(Roles.Reserva);

        if (authorIsOfficerOfMember && isBackup) {
          try {
            await member.roles.remove(backupRole);
          } catch (e) {
            console.error(e);
          }
        }

        const name = member.displayName;
        const value = !authorIsOfficerOfMember
          ? 'No pertenece a tu gremio'
          : !isBackup
            ? 'No tiene el rol de Reserva'
            : 'Rol de reserva eliminado';

        fields.push({ name, value });
      }

      const embed = this.createEmbed({
        title: 'Retirar rol de Reserva',
        description: 'Retira el rol de Reserva a los miembros mencionados',
        fields,
      });
      try {
        await msg.channel.send({ embed });
      } catch (e) {
        console.log(e);
      }
    }
  }

  private addToGuild() {
    return async (msg: Message) => {
      const authorOfficerRolesNames = this.officerRolesNames(msg.member);
      if (!authorOfficerRolesNames.length) {
        const embed = this.createErrorEmbed({ title: 'Error', description: 'No eres oficial de ningún gremio.' });
        await msg.channel.send({ embed });
        return;
      }

      const authorGuildRoles: string[] = authorOfficerRolesNames.map((roleName: string) => guildRoleNameByOfficerRole[roleName]);
      const targetGuildRoles: Role[] = Array.from(msg.mentions.roles.values());
      const guildRolesToAdd = targetGuildRoles.filter((guildRole: Role) => authorGuildRoles.includes(guildRole.name));
      const bannedGuildRoles = targetGuildRoles.filter((guildRole: Role) => !authorGuildRoles.includes(guildRole.name));

      for (const bannedGuildRole of bannedGuildRoles) {
        await msg.channel.send({ embed: this.createErrorEmbed({ title: 'Error', description: 'No puedes añadir el rol ' + bannedGuildRole.name + '.' }) });
        return;
      }

      if (!guildRolesToAdd.length) {
        await msg.channel.send({ embed: this.createErrorEmbed({ title: 'Error', description: 'Necesitas indicar el rol a añadir.' }) });
        return;
      }

      const fields = [];
      for (const member of msg.mentions.members.values()) {
        try {
          await member.roles.add(guildRolesToAdd);
        } catch (e) {
          console.error(e);
        }

        const name = member.displayName;
        const value = 'Añadido a ' + Array.from(guildRolesToAdd).map((role: Role) => role.name).join(', ');

        fields.push({ name, value });
      }

      if (!fields.length) { return; }

      const embed = this.createEmbed({
        title: 'Añadir al gremio',
        description: 'Añadidos al gremio',
        fields,
      });
      try {
        await msg.channel.send({ embed });
      } catch (e) {
        console.log(e);
      }
    };
  }

  private removeFromGuild() {
    return async (msg: Message) => {
      const authorOfficerRolesNames = this.officerRolesNames(msg.member);
      if (!authorOfficerRolesNames.length) {
        const embed = this.createErrorEmbed({ title: 'Error', description: 'No eres oficial de ningún gremio.' });
        await msg.channel.send({ embed });
        return;
      }

      const authorGuildRoles: string[] = authorOfficerRolesNames.map((roleName: string) => guildRoleNameByOfficerRole[roleName]);
      const targetGuildRoles: Role[] = Array.from(msg.mentions.roles.values());
      const guildRolesToRemove = targetGuildRoles.filter((guildRole: Role) => authorGuildRoles.includes(guildRole.name));
      const bannedGuildRoles = targetGuildRoles.filter((guildRole: Role) => !authorGuildRoles.includes(guildRole.name));

      for (const bannedGuildRole of bannedGuildRoles) {
        await msg.channel.send({ embed: this.createErrorEmbed({ title: 'Error', description: 'No puedes quitar el rol ' + bannedGuildRole.name + '.' }) });
        return;
      }

      if (!guildRolesToRemove.length) {
        await msg.channel.send({ embed: this.createErrorEmbed({ title: 'Error', description: 'Necesitas indicar el rol a eliminar.' }) });
        return;
      }

      const fields = [];
      for (const member of msg.mentions.members.values()) {
        try {
          await member.roles.remove(guildRolesToRemove);
        } catch (e) {
          console.error(e);
        }

        const name = member.displayName;
        const value = 'Eliminado de ' + Array.from(guildRolesToRemove).map((role: Role) => role.name).join(', ');

        fields.push({ name, value });
      }

      if (!fields.length) { return; }

      const embed = this.createEmbed({
        title: 'Eliminar del gremio',
        description: 'Eliminados del gremio',
        fields,
      });
      try {
        await msg.channel.send({ embed });
      } catch (e) {
        console.log(e);
      }
    };
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
    return member.roles.cache.map((role: Role) => role.name);
  }

  private createErrorEmbed({ title, description }) {
    return this.createEmbed({ title, description, color: 0xdf342a });
  }

  private createEmbed({ title = '', description, color = 3447003, fields = [] }) {
    return { color, title, description, fields, timestamp: new Date(), footer: { text: '© Comunidad Vórtice' } };
  }
}

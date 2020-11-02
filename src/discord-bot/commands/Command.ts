import { Message } from 'discord.js';

export default abstract class Command {
  static alias: string;

  abstract execute(msg: Message): Promise<Message | Message[]>;

  protected createErrorEmbed({ title, description }) {
    return this.createEmbed({ title, description, color: 0xdf342a });
  }

  protected createEmbed({ title = '', description, color = 3447003, fields = [] }) {
    return { color, title, description, fields, timestamp: new Date(), footer: { text: '© Comunidad Vórtice' } };
  }
}

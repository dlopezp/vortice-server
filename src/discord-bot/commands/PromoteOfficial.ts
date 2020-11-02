import { Message } from 'discord.js';
import Command from './Command';

export default class PromoteOfficial extends Command {
  static alias = 'po';

  execute(msg: Message): Promise<Message | Message[]> {
    return msg.channel.send({
      embed: {
        color: 0xdf342a,
        title: 'Error',
        description: 'lalala',
        fields: [],
        timestamp: new Date(),
        footer: { text: '© Comunidad Vórtice' },
      }
    });
  }
}

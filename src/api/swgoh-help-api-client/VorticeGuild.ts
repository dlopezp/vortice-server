import SwgohHelpGuild from './SwgohHelpGuild';
import { SwgohHelpGuildLeader, isLeader } from './SwgohHelpGuildMemberLevel';
import SwgohHelpGuildRoster from './SwgohHelpGuildRoster';

type VorticePlayers = {
  [key: number]: SwgohHelpGuildRoster;
};

export default class VorticeGuild {
  constructor(
    public readonly id: string,
    public readonly leaderAllyCode: number,
    public readonly name: string,
    public readonly desc: string,
    public readonly logo: string,
    public readonly gp: number,
    public readonly root: boolean,
    public readonly players: VorticePlayers,
    public readonly allyCodes: number[],
  ) {}

  static fromHelp(apiGuild: SwgohHelpGuild) {
    const leader = apiGuild.roster.find(isLeader);
    const allyCodes: number[] = apiGuild.roster.map(player => player.allyCode);
    const players = apiGuild.roster.reduce(
      (carry, player) => ({ ...carry, [player.allyCode]: player }),
      {},
    );

    return new VorticeGuild(
      apiGuild.id,
      leader ? leader.allyCode : apiGuild.roster[0].allyCode,
      apiGuild.name,
      apiGuild.desc,
      apiGuild.bannerLogo,
      apiGuild.gp,
      false,
      players,
      allyCodes,
    );
  }
}

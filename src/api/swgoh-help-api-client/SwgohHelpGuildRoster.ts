import { SwgohHelpGuildMemberLevel } from "./SwgohHelpGuildMemberLevel";

export default interface SwgohHelpGuildRoster {
  id: string;
  guildMemberLevel: SwgohHelpGuildMemberLevel;
  name: string;
  level: number;
  allyCode: number;
  gp: number;
  gpChar: number;
  gpShip: number;
}

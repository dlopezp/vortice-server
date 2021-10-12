import SwgohHelpGuildRoster from './SwgohHelpGuildRoster';

export default interface SwgohHelpGuild {
  id: string;
  name: string;
  desc: string;
  members: number;
  message: string;
  gp: number;
  bannerLogo: string;
  roster: SwgohHelpGuildRoster[];
}

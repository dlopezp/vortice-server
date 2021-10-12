export type SwgohHelpGuildLeader = 4 | 'GUILDLEADER';
export type SwgohHelpGuildOfficer = 3 | 'GUILDOFFICER';
export type SwgohHelpGuildMember = 2 | 'GUILDMEMBER';
export type SwgohHelpGuildMemberLevel = SwgohHelpGuildLeader | SwgohHelpGuildOfficer | SwgohHelpGuildMember;

export function isLeader({ guildMemberLevel }: { guildMemberLevel: SwgohHelpGuildMemberLevel }) {
  return guildMemberLevel === 4 || guildMemberLevel === 'GUILDLEADER';
}

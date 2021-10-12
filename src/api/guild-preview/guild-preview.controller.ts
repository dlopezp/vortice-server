import { Controller, Get, Param } from '@nestjs/common';
import { SwgohHelpApiClientService } from '../swgoh-help-api-client/swgoh-help-api-client.service';
import SwgohHelpGuild from '../swgoh-help-api-client/SwgohHelpGuild';
import VorticeGuild from '../swgoh-help-api-client/VorticeGuild';

@Controller('guild-preview')
export class GuildPreviewController {

  constructor(
    private readonly client: SwgohHelpApiClientService,
  ) {}

  @Get(':allyCode')
  async byAllyCode(@Param() params): Promise<VorticeGuild> {
    const leaderAllyCode = params.allyCode;
    const apiGuild: SwgohHelpGuild = await this.client.guildByLeaderAllyCode(leaderAllyCode);
    const vorticeGuild = VorticeGuild.fromHelp(apiGuild);

    return vorticeGuild;
  }
}

import { HttpModule, Module } from '@nestjs/common';
import { GuildPreviewController } from './guild-preview/guild-preview.controller';
import { SwgohHelpApiClientService } from './swgoh-help-api-client/swgoh-help-api-client.service';

@Module({
  imports: [HttpModule],
  controllers: [GuildPreviewController],
  providers: [SwgohHelpApiClientService],
})
export class ApiModule {}

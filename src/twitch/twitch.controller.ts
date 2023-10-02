import { Controller, Get } from '@nestjs/common';

import { Logger } from 'nestjs-pino';
import { TwitchService } from './twitch.service';

@Controller('twitch')
export class TwitchController {
  constructor(
    private readonly twitchService: TwitchService,
    private readonly logger: Logger,
  ) {}

  @Get()
  async processStreams(): Promise<void> {
    await this.twitchService.processStreamsForMessaging();
  }
}

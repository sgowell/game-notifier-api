import { Controller, Get } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { DiscordService } from './discord.service';

@Controller('discord')
export class DiscordController {
  constructor(
    private readonly discordService: DiscordService,
    private readonly logger: Logger,
  ) {}

  @Get('name')
  getDiscordChannelName(): string {
    return '';
  }
}

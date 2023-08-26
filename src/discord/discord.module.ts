import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';

@Module({
  imports: [LoggerModule.forRoot()],
  controllers: [DiscordController],
  providers: [DiscordService],
})
export class DiscordModule {}

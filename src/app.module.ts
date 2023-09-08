import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiscordController } from './discord/discord.controller';
import { DiscordModule } from './discord/discord.module';
import { DiscordService } from './discord/discord.service';
import { TwitchController } from './twitch/twitch.controller';
import { TwitchModule } from './twitch/twitch.module';
import { TwitchService } from './twitch/twitch.service';

@Module({
  imports: [LoggerModule.forRoot(), DiscordModule, TwitchModule],
  controllers: [AppController, DiscordController, TwitchController],
  providers: [AppService, DiscordService, TwitchService],
})
export class AppModule {}

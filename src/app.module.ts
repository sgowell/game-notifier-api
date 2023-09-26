import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiscordController } from './discord/discord.controller';
import { DiscordModule } from './discord/discord.module';
import { DiscordService } from './discord/discord.service';
import { IgdbController } from './igdb/igdb.controller';
import { IgdbModule } from './igdb/igdb.module';
import { IgdbService } from './igdb/igdb.service';
import { TwitchController } from './twitch/twitch.controller';
import { TwitchModule } from './twitch/twitch.module';
import { TwitchService } from './twitch/twitch.service';

@Module({
  imports: [
    LoggerModule.forRoot(),
    DiscordModule,
    TwitchModule,
    CacheModule.register(),
    IgdbModule,
  ],
  controllers: [
    AppController,
    DiscordController,
    TwitchController,
    IgdbController,
  ],
  providers: [AppService, DiscordService, TwitchService, IgdbService],
})
export class AppModule {}

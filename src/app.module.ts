import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { DiscordModule } from './discord/discord.module';
import { DiscordController } from './discord/discord.controller';
import { DiscordService } from './discord/discord.service';

@Module({
  imports: [LoggerModule.forRoot(), DiscordModule],
  controllers: [AppController, DiscordController],
  providers: [AppService, DiscordService],
})
export class AppModule {}

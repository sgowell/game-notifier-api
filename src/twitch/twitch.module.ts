import { Module } from '@nestjs/common';
import { TwitchController } from './twitch.controller';
import { TwitchService } from './twitch.service';

@Module({
  providers: [TwitchService],
  controllers: [TwitchController],
})
export class TwitchModule {}

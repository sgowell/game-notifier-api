import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ApiClient } from '@twurple/api';
import { AppTokenAuthProvider } from '@twurple/auth';
import { Cache } from 'cache-manager';
import 'dotenv/config';
import translate from 'translate';

import { Twilio } from 'twilio';

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

const authProvider = new AppTokenAuthProvider(clientId, clientSecret);

const apiClient = new ApiClient({ authProvider });
const defaultIGDBIds = [process.env.DEFAULT_IGDB_ID];
const cacheTimeout = 60 * 1000 * 10; //10 minutes in milliseconds // Should this be in environment vars?

@Injectable()
export class TwitchService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async processStreamsForMessaging(igdbIds: string[] = defaultIGDBIds) {
    await apiClient.games.getGamesByIgdbIds(igdbIds).then(async (games) => {
      games.forEach(async (item) => {
        await item.getStreams().then(async (gameStreams) => {
          if (gameStreams.data.length < 1) {
            const noStreams = `No ${item.name} Streams found\nCheck Back Later\nCheers.`;
            console.log(noStreams);
          } else {
            gameStreams.data.forEach(async (stream) => {
              const user = await stream.getUser();

              let body = '';
              if (!this.cacheManager.get(user.id)) {
                apiClient.chat.getSettings(user.id).then(async (settings) => {
                  body += `${user.name}\n`;
                  body += await this.buildLocalizedBody(stream.language);
                  body += this.buildFollowerModeBody(
                    settings.followerOnlyModeEnabled,
                    settings.followerOnlyModeDelay,
                  );

                  body += `\n${new Date(Date.now())}\n`;
                  this.sendMessage(body);
                  await this.cacheManager.set(user.id, user.name, cacheTimeout);
                });
              }
            });
          }
        });
      });
    });
  }

  private async buildLocalizedBody(
    languageCode: string = 'en',
  ): Promise<string> {
    let localizedBody = '';
    if (languageCode !== 'en') {
      const language = `language: ${languageCode}\n`;

      const translatedMessage = await this.buildTranslatedMessage(languageCode);

      localizedBody += language;
      localizedBody += `${translatedMessage}\n`;
    }
    return localizedBody;
  }

  private buildFollowerModeBody(
    enabled: boolean = false,
    followDelay: number = null,
  ): string {
    let followerModeBody = '';
    if (enabled) {
      const delay = followDelay ?? 'none';
      const followerDelayString = `Followers Only - Delay: ${delay} minutes\n`;
      followerModeBody += followerDelayString;
    }

    return followerModeBody;
  }

  private sendMessage(body) {
    client.messages
      .create({
        body: body,
        to: `+${process.env.TWILIO_TO_NUMBER}`,
        from: `+${process.env.TWILIO_FROM_NUMBER}`,
      })
      .then((message) => console.log(message.sid));
  }

  private async buildTranslatedMessage(languageCode = 'en') {
    return await translate(
      'Hello. Hope you are having a good stream. I have subscriber perks to this game. Is it ok for me to use them?',
      {
        to: languageCode,
        engine: 'google', // dunno why the string from env wasn't working :/
        key: process.env.TRANSLATE_KEY,
      },
    );
  }
}

import { Injectable } from '@nestjs/common';
import { ApiClient } from '@twurple/api';
import { AppTokenAuthProvider } from '@twurple/auth';
import 'dotenv/config';
import translate from 'translate';

import pkg from 'twilio';
const { Twilio } = pkg;

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

const authProvider = new AppTokenAuthProvider(clientId, clientSecret);
const barWithEndline = '---\n';

const apiClient = new ApiClient({ authProvider });

@Injectable()
export class TwitchService {
  async processStreamsForMessaging() {
    await apiClient.games
      .getGamesByIgdbIds([process.env.IGDB_ID])
      .then(async (games) => {
        games.forEach(async (item) => {
          await item.getStreams().then(async (gameStreams) => {
            if (gameStreams.data.length < 1) {
              const noStreams = `No ${item.name} Streams found\nCheck Back Later\nCheers.`;
              console.log(noStreams);
              this.sendMessage(noStreams);
            } else {
              gameStreams.data.forEach(async (stream) => {
                let body = '';
                const user = await stream.getUser();

                apiClient.chat.getSettings(user.id).then((settings) => {
                  const twitchUrl = `Twitch URL: twitch://open?stream=${user.name}\n`;
                  body += twitchUrl;
                  console.log(twitchUrl);

                  if (stream.language !== 'en') {
                    const language = `language: ${stream.language}\n`;
                    body += language;

                    body += barWithEndline;
                    body += this.buildTranslatedMessage(stream.language);
                    body += barWithEndline;

                    console.log(language);
                  }

                  const followerModeEnabled = settings.followerOnlyModeEnabled;
                  if (followerModeEnabled) {
                    const delay = settings.followerOnlyModeDelay ?? 'none';
                    const followerDelay = `Followers Only - Delay: ${delay} minutes\n`;
                    body += followerDelay;
                    console.log(followerDelay);
                  }

                  this.sendMessage(body);
                  console.log(body);
                  console.log(barWithEndline);
                });
              });
            }
          });
        });
      });
  }

  sendMessage(body) {
    client.messages
      .create({
        body: body,
        to: `+${process.env.TWILIO_TO_NUMBER}`,
        from: `+${process.env.TWILIO_FROM_NUMBER}`,
      })
      .then((message) => console.log(message.sid));
  }

  async buildTranslatedMessage(languageCode = 'en') {
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

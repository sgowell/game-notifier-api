import { Injectable } from '@nestjs/common';
import {
  WhereInFlags,
  fields,
  igdb,
  twitchAccessToken,
  whereIn,
} from 'ts-igdb-client';

@Injectable()
export class IgdbService {
  private twitchSecrets = {
    client_id: process.env.TWITCH_CLIENT_ID,
    client_secret: process.env.TWITCH_CLIENT_SECRET,
  };

  private IGDB_GAME_IDS = [process.env.DEFAULT_IGDB_ID];

  async getData() {
    const accessToken = await twitchAccessToken(this.twitchSecrets);
    // generate an IGDB client with twitch credentials
    const client = igdb(this.twitchSecrets.client_id, accessToken);

    // build and execute a query
    const { data } = await client
      .request('games')
      //.pipe(fields('*'), where('id', '=', process.env.DEFAULT_IGDB_ID))
      .pipe(fields('*'), whereIn('id', this.IGDB_GAME_IDS, WhereInFlags.AND))
      .execute();

    return data;
  }
}

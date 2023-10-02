import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import {
  WhereInFlags,
  fields,
  igdb,
  twitchAccessToken,
  whereIn,
} from 'ts-igdb-client';

const defaultIGDBIds = [process.env.DEFAULT_IGDB_ID];

@Injectable()
export class IgdbService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private twitchSecrets = {
    client_id: process.env.TWITCH_CLIENT_ID,
    client_secret: process.env.TWITCH_CLIENT_SECRET,
  };

  async getData(igdbIds: string[] = defaultIGDBIds) {
    if (!this.cacheManager.get('IGDB_DATA')) {
      const accessToken = await twitchAccessToken(this.twitchSecrets);
      const client = igdb(this.twitchSecrets.client_id, accessToken);

      const { data } = await client
        .request('games')
        .pipe(fields('*'), whereIn('id', igdbIds, WhereInFlags.AND))
        .execute();

      await this.cacheManager.set('IGDB_DATA', data, 86400); // 1 Day
      return data;
    }
    return this.cacheManager.get('IGBD_DATA');
  }
}

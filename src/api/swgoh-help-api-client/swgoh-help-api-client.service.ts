import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SwgohHelpGuild from './SwgohHelpGuild';

function chunkArray(myArray, chunk_size) {
  let index: number = 0;
  const arrayLength: number = myArray.length;
  const tempArray: any[] = [];
  let myChunk: any[];

  for (index = 0; index < arrayLength; index += chunk_size) {
      myChunk = myArray.slice(index, index + chunk_size);
      tempArray.push(myChunk);
  }

  return tempArray;
}

const CHUNK_SIZE = 10;

@Injectable()
export class SwgohHelpApiClientService {
  private token: string;
  private urlBase: string = 'https://api.swgoh.help';
  private userQuery: string;
  private headers: HeadersInit = { 'Content-Type': 'application/json' };

  constructor(
    private readonly configService: ConfigService,
    private readonly http: HttpService,
  ) {
    const username = this.configService.get('SWGOH_HELP_USERNAME');
    const password = this.configService.get('SWGOH_HELP_PASSWORD');
    const clientId = this.configService.get('SWGOH_HELP_CLIENT_ID');
    const secret   = this.configService.get('SWGOH_HELP_SECRET');
    this.userQuery = `username=${username}&password=${password}&grant_type=password&client_id=${clientId}&client_secret=${secret}`;
  }

  async post(url, body, config = null) {
    try {
      return await this.http
        .post(
          url,
          typeof body === 'string' ? body : JSON.stringify(body),
          config || { headers: this.headers },
        )
        .toPromise();
    } catch (error) {
      console.log(error);
    }
  }

  async login() {
    const url = `${this.urlBase}/auth/signin`;
    const body = this.userQuery;
    const config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };

    const response = await this.post(url, body, config);

    if (response.status !== 200) {
      throw new Error('! Cannot login with these credentials');
    }

    const token: any = response.data;
    this.token = token.access_token;
    this.headers['Authorization'] = `Bearer ${this.token}`;
  }

  async guildsByLeadersAllyCodes(allyCodes) {
    if (!this.token) {
      await this.login();
    }

    const allyCodesRequests = chunkArray(allyCodes, 2);
    let data = [];

    for (const allyCodesRequest of allyCodesRequests) {
      data = data.concat(await this.getGuildsByLeadersAllyCodes(allyCodesRequest));
    }

    return data;
  }

  async getGuildsByLeadersAllyCodes(allyCodes) {
    const fetchUrl = `${this.urlBase}/swgoh/guilds`;
    const body = { allycodes: allyCodes }

    const response = await this.http.post(fetchUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body),
    }).toPromise();

    return response.data;
  }

  async guildByLeaderAllyCode(allyCode): Promise<SwgohHelpGuild> {
    if (!this.token) {
      await this.login();
    }

    const fetchUrl = `${this.urlBase}/swgoh/guilds`;
    const body = { allycodes: [ allyCode ] };
    console.log(body);
    const response = await this.post(fetchUrl, body);

    const data = response.data;

    return data[0];
  }

  async getRoster(allyCodes) {
    const fetchUrl = `${this.urlBase}/swgoh/roster`;
    const body = {
      allycodes: allyCodes,
      project: {
        allyCode: true,
        gp: true,
        starLevel: true,
        level: true,
        gearLevel: true,
        gear: true,
        zetas: true,
        defId: true,
        mods: {
          set: true,
          level: true,
          stat: true,
        },
      },
    };

    const response = await this.http.post(fetchUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    }).toPromise();

    return response.data;
  }

  async roster(allyCodes) {
    if (!this.token) {
      await this.login();
    }

    const allyCodesRequests = chunkArray(allyCodes, CHUNK_SIZE);
    let data = [];

    for (let allyCodesRequest of allyCodesRequests) {
      data = data.concat(await this.getRoster(allyCodesRequest));
    }

    return data;
  }

  async getPlayers(allyCodes) {
    const fetchUrl = `${this.urlBase}/swgoh/players`;
    const body = {
      allycodes: allyCodes,
      project: {
        allyCode: true,
        roster: {
          defId: true,
          relic: true,
          gp: true,
          level: true,
          gear: true,
          combatType: true,
          mods: true,
          rarity: true,
          skills: true,
          equipped: true,
        },
      },
    };

    const response = await this.http.post(fetchUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    }).toPromise();

    return response.data;
  }

  async players(allyCodes) {
    if (!this.token) {
      await this.login();
    }

    const allyCodesRequests = chunkArray(allyCodes, CHUNK_SIZE);
    let data = [];

    for (const allyCodesRequest of allyCodesRequests) {
      data = data.concat(await this.getPlayers(allyCodesRequest));
    }

    return data;
  }

  async gearList() {
    if (!this.token) {
      await this.login();
    }

    const fetchUrl = `${this.urlBase}/swgoh/data`;
    const body = {
      collection: "equipmentList",
      projection: {
        id: true,
        equipmentStat: true
      },
      enum: true,
    };

    const response = await this.http.post(fetchUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    }).toPromise();

    const data = response.data;

    return data;
  }

  async unitsList() {
    if (!this.token) {
      await this.login();
    }

    const fetchUrl = `${this.urlBase}/swgoh/data`;
    const body = {
      collection: 'unitsList',
      language: 'SPA_XM',
      // enums: true,
      match: {
        rarity: 7,
        obtainable: true
      },
      project: {
        baseId: true,
        nameKey: true,
        forceAlignment: true,
        combatType: true,
        thumbnailName: true,
      },
    };

    const response = await this.http.post(fetchUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    }).toPromise();

    const data = response.data;

    return data;
  }

  async modsList() {
    if (!this.token) {
      await this.login();
    }

    const fetchUrl = `${this.urlBase}/swgoh/data`;
    const body = {
      collection: 'statModSetList',
      projection: {
        id: true,
        setCount: true,
        completeBonus: true,
      },
      enum: true,
    };

    const response = await this.http.post(fetchUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    }).toPromise();

    const data = response.data;

    return data;
  }

  async getGacHistory(allyCodes) {
    const fetchUrl = `${this.urlBase}/swgoh/players`;
    const body = {
      allycodes: allyCodes,
      project: {
        allyCode: true,
        grandArena: true,
      },
    };

    const response = await this.http.post(fetchUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    }).toPromise();

    return response.data;
  }

  async gacHistory(allyCodes) {
    if (!this.token) {
      await this.login();
    }

    const allyCodesRequests = chunkArray(allyCodes, CHUNK_SIZE);
    let data = [];

    for (const allyCodesRequest of allyCodesRequests) {
      data = data.concat(await this.getGacHistory(allyCodesRequest));
    }

    return data;
  }
}

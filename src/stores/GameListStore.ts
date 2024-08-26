import { makeAutoObservable } from 'mobx';
import LobbyGame from '../types/LobbyGamesTypes';
import api, { Api, Endpoints } from '../api';
import { AxiosError } from 'axios';

class GameListStore {
  games: LobbyGame[] = [];
  isLoading = false;
  errorText: string | null = null;

  api: Api;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.api = api;
  }

  private setError(val: string | null): void {
    this.errorText = val;
  }

  private setIsLoading(val: boolean): void {
    this.setError(null);
    this.isLoading = val;
  }

  private setGames(gameList: LobbyGame[]): void {
    this.games = gameList;
  }

  async updateGameList() {
    this.setIsLoading(true);

    try {
      const gameList = (await this.api.fetch(Endpoints.GAMES)) as LobbyGame[];
      this.setGames(gameList);
    } catch (error) {
      if (error instanceof AxiosError) {
        this.setError('Failed to fetch game list: ' + error.message);
      } else {
        console.error('An unknown error occurred while fetching the game list:', error);
        this.setError('An unknown error occurred. Please try again later.');
      }
    } finally {
      this.setIsLoading(false);
    }
  }
}

export default new GameListStore();

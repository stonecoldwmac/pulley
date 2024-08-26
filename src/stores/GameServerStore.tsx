import { makeAutoObservable } from 'mobx';
import api, { Api, Endpoints } from '../api';
import { AxiosError } from 'axios';
import {
  GameEventType,
  GameEvents,
  PlayerCommands,
  PlayerPayload,
} from '../types/WSCommandEventTypes';
import LobbyGame from '../types/LobbyGamesTypes';

class GameServerStore {
  userName: string | null = null;
  isLoading = false;
  errorText: string | null;
  joinedGameList: {
    [key: string]: { id: string; name: string; state: LobbyGame['state'] | 'ready' | 'joined' };
  } = {};
  gameStartedId: string | null = null;
  gameCreatedName: string | null = null;

  api: Api;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.errorText = null;
    this.api = api;
  }

  private setIsLoading(val: boolean): void {
    this.isLoading = val;
  }

  private setError(val: string | null): void {
    this.errorText = val;
  }

  private wsFormattedMessage(type: PlayerCommands, nonce: string, payload: PlayerPayload) {
    return { type, nonce, payload };
  }

  get isConnected() {
    return this.api.isWsReady;
  }

  get waitingGameList() {
    return Object.values(this.joinedGameList).filter((a) => a.state === 'waiting');
  }

  get joinGameList() {
    return Object.values(this.joinedGameList).filter((a) => a.state === 'joined');
  }

  get readyGameList() {
    return Object.values(this.joinedGameList).filter((a) => a.state === 'ready');
  }

  async sendPlayerCreateGame(gameName: string, questionCount: number) {
    const message = this.wsFormattedMessage(PlayerCommands.CREATE, 'create', {
      name: gameName,
      question_count: questionCount,
    });
    await this.api.wsSend(JSON.stringify(message));
    this.gameCreatedName = gameName;
  }

  async sendPlayerJoinGame(id: string) {
    const message = this.wsFormattedMessage(PlayerCommands.JOIN, '', {
      game_id: id,
    });
    await this.api.wsSend(JSON.stringify(message));
    this.joinedGameList[id].state = 'joined';
  }

  async sendPlayerReadyGame(id: string) {
    const message = this.wsFormattedMessage(PlayerCommands.READY, '', {
      game_id: id,
    });
    await this.api.wsSend(JSON.stringify(message));
  }

  async sendPlayerStartGame(id: string) {
    const message = this.wsFormattedMessage(PlayerCommands.START, '', {
      game_id: id,
    });
    await this.api.wsSend(JSON.stringify(message));
  }

  updateGameList(event: GameEventType) {
    switch (event.type) {
      case GameEvents.CREATE:
        if (event.payload.name) {
          this.joinedGameList = {
            ...this.joinedGameList,
            [event.id]: {
              id: event.id,
              name: event.payload.name,
              state: this.gameCreatedName === event.payload.name ? 'joined' : 'waiting',
            },
          };
        }
        break;
      case GameEvents.PLAYERENTER:
        if (this.userName && this.gameCreatedName !== event.payload.name && event.payload.players?.includes(this.userName)) {
          this.joinedGameList[event.id].state = 'joined';
        } else if (event.payload?.name) {
          this.joinedGameList = {
            ...this.joinedGameList,
            [event.id]: {
              id: event.id,
              name: event.payload.name,
              state: this.gameCreatedName === event.payload.name ? 'joined' : 'waiting',
            },
          };
        }
        break;
      case GameEvents.READY:
        this.gameStartedId = null;
        if (
          event.id &&
          this.joinedGameList[event.id] &&
          this.joinedGameList[event.id].state === 'joined'
        ) {
          this.joinedGameList[event.id].state = 'ready';
        }
        break;
      case GameEvents.START:
        this.gameStartedId = event.id;
        break;
      case GameEvents.DESTROY:
        delete this.joinedGameList[event.id];
        break;
      default:
        break;
    }
  }

  async disconnect() {
    await this.api.closeWebsocket();
    this.gameStartedId = null;
    this.setError(null);
    this.setIsLoading(true);
  }

  async connect(userName: string): Promise<void> {
    this.setIsLoading(true);
    this.userName = '';
    try {
      await this.api.closeWebsocket();
      this.setError(null);
      this.userName = userName;
      await this.api.connectWebsocket(userName, [this.updateGameList]);
    } catch (error) {
      if (error instanceof AxiosError) {
        this.setError('Failed to connect to game server: ' + error.message);
      } else {
        console.error('An unknown error occurred while fetching the game list:', error);
        this.setError('An unknown error occurred. Please try again later.');
      }
    } finally {
      this.setIsLoading(false);
    }
  }
}

export default new GameServerStore();

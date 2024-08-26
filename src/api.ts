import { Axios } from 'axios';
import { makeAutoObservable } from 'mobx';
import { GameEventType } from './types/WSCommandEventTypes';

export enum Endpoints {
  GAMES = '/games',
  CONNECT = '/connect',
}

const isMessageEvent = (event: Event): event is MessageEvent => {
  return 'data' in event;
};

export class Api {
  url: string;
  client: Axios;
  socket: WebSocket | null = null;
  messageList: MessageEvent[] = [];
  isWsReady = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.url = import.meta.env.VITE_BASE_URL;
    if (this.url.endsWith('/')) {
      this.url = this.url.slice(0, -1);
    }

    this.client = new Axios({ baseURL: `http://${this.url}` });
  }

  setIsWsReady(val: boolean): void {
    this.isWsReady = val;
  }

  connectWebsocket = async (name: string, messageFunctions: ((data: GameEventType) => void)[]) => {
    this.socket = new WebSocket(`ws://${this.url}${Endpoints.CONNECT}?name=${name}`);

    if (this.socket) {
      // Connection opened
      this.socket.addEventListener('open', () => {
        if (this.socket) {
          this.setIsWsReady(true);
        }
      });

      // Listen for messages
      this.socket.addEventListener('message', (event: Event) => {
        if (this.socket && isMessageEvent(event)) {
          const data = JSON.parse(event.data);
          messageFunctions.forEach((func) => func(data));
          this.messageList.push(event);
          if (this.messageList.length > 49) {
            this.messageList = this.messageList.slice(1);
          }
        }
      });

      this.socket.addEventListener('close', (event) => {
        this.setIsWsReady(false);
      });

      this.socket.addEventListener('error', (event) => {
        this.setIsWsReady(false);
      });
    }
  };

  closeWebsocket = async () => {
    if (this.socket) {
      this.socket?.close();
      this.socket = null;
    }
    this.setIsWsReady(false);
  };

  wsSend = async (data: ArrayBufferLike | ArrayBufferView | Blob | string) => {
    if (this.socket && data) {
      this.socket.send(data);
    }
  };

  fetch = async (endpoint: Endpoints, params?: Record<string, string | Record<string, string>>) => {
    try {
      const response = await this.client.get(endpoint, params);
      if (response.status != 200) {
        throw new Error('Failed to retrieve info');
      }
      return JSON.parse(response.data);
    } catch (error) {
      console.error(`Error fetching endpoint ${endpoint}`, error);
      throw error;
    }
  };
}

export default new Api();

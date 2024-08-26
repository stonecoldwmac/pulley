export enum PlayerCommands {
  CREATE = 'create',
  JOIN = 'join',
  READY = 'ready',
  START = 'start',
  ANSWER = 'answer',
}

export enum GameEvents {
  CREATE = 'game_create',
  STATECHANGE = 'game_state_change',
  PLAYERCOUNT = 'game_player_count',
  DESTROY = 'game_destroy',
  PLAYERENTER = 'game_player_enter',
  READY = 'game_player_ready',
  START = 'game_start',
}

type GameEventType = {
  id: string;
  type: GameEvents;
  payload: {
    name?: string;
    players?: string[];
    players_ready?: string[];
    question_count?: number;
  };
};

type PlayerCommandPayload = {
  game_id: string;
};

type PlayerCommandCreate = { name: string; question_count: number };

type PlayerCommandAnswer = PlayerCommandPayload & { index: number; question_id: string };

type PlayerPayload = PlayerCommandPayload | PlayerCommandCreate | PlayerCommandAnswer;

type PlayerCommand = {
  nonce: string;
  payload: PlayerPayload;
  type: PlayerCommands;
};

export type {
  PlayerCommand,
  PlayerPayload,
  PlayerCommandPayload,
  PlayerCommandCreate,
  PlayerCommandAnswer,
  GameEventType,
};

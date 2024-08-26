import GameServerStore from '../stores/GameServerStore';
import { observer } from 'mobx-react-lite';
import LobbyGame from '../types/LobbyGamesTypes';

const ReadyUpButton = ({ game }: { game: LobbyGame }) => {
  const {
    sendPlayerReadyGame,
    sendPlayerStartGame,
    sendPlayerJoinGame,
    readyGameList,
    joinGameList,
  } = GameServerStore;

  if (readyGameList.some((el) => el.id === game?.id)) {
    return (
      <button onClick={async () => {await sendPlayerStartGame(game.id);
        }} className='btn btn-primary'>
        Start
      </button>
    );
  }

  if (joinGameList.some((el) => el.id === game?.id)) {
    return (
      <button onClick={async () => { await sendPlayerReadyGame(game.id);
        }} className='btn btn-secondary'>
        Ready
      </button>
    );
  }

  return (
    <button onClick={() => sendPlayerJoinGame(game.id)} className='btn btn-info'>
      Join
    </button>
  );
};
export default observer(ReadyUpButton);

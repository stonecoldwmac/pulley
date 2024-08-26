import { useEffect, useState } from 'react';
import GameListStore from '../../stores/GameListStore';
import NewGameModal from '../../components/NewGameModal';
import GameServerStore from '../../stores/GameServerStore';
import { generateSlug } from 'random-word-slugs';
import { observer } from 'mobx-react-lite';
import ReadyUpButton from '../../components/ReadyUpButton';
import { reaction } from 'mobx';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const { games, isLoading, errorText, updateGameList } = GameListStore;
  const {
    connect,
    disconnect,
    isConnected,
    sendPlayerCreateGame,
    waitingGameList,
    readyGameList,
    gameStartedId,
  } = GameServerStore;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState<string>(generateSlug());

  const navigate = useNavigate();

  const handleConnect = async () => {
    await connect(name);
    await updateGameList();
  };
  const handleDisconnect = async () => {
    await disconnect();
    setName(generateSlug());
  };

  useEffect(() => {
    updateGameList();
  }, []);

  useEffect(() => {
    if (gameStartedId) navigate(`/game/${gameStartedId}`);
  }, [gameStartedId]);

  return (
    <div className='container mx-auto'>
      <h1 className='text-2xl font-bold my-4'>Game Lobby</h1>
      <div className='flex justify-between m-8'>
        <label className='input input-bordered flex items-center justify-between gap-4 font-semibold mb-4'>
          Player Name
          <span className='grow w-60 mr-4 grow-0 font-normal'>{name}</span>
        </label>
        {!isConnected ? (
          <button type='submit' onClick={handleConnect} className='btn btn-success'>
            Connect
          </button>
        ) : (
          <button type='submit' onClick={handleDisconnect} className='btn btn-warning'>
            Disconnect
          </button>
        )}
      </div>
      <div className='card-bordered rounded-lg mx-auto mb-4 bg-neutral'>
        <div className='card-title'>
          <h2 className='text-lg font-bold mb-4 px-4'>List of Available Games</h2>
        </div>
        <div className='card-body'>
          {isLoading ? (
            <p>Loading games...</p>
          ) : errorText ? (
            <p className='text-red-500'>{errorText}</p>
          ) : games.length === 0 ? (
            <p>No games available.</p>
          ) : (
            <ul className='space-y-2 bg-accent-content rounded-lg'>
              {games.map((game) => (
                <div>
                  <li key={game.id} className='bg-gray p-4 rounded flex flex-column'>
                    <div className='w-full h-full flex flex-col'>
                      <h2 className='text-xl font-semibold'>{game.name}</h2>
                      <p className=''>Question Count: {game.questionCount}</p>
                      <p>State: {game.state}</p>
                    </div>
                    {isConnected && (
                      <div className='w-8 h-full flex flex-col items-center justify-between mr-4'>
                        <ReadyUpButton game={game} />
                      </div>
                    )}
                  </li>
                  <div className='divider w-4/5 m-auto'></div>
                </div>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className='flex justify-between m-8'>
        <button onClick={updateGameList} className='btn btn-info'>
          Refresh List
        </button>
        <button
          disabled={!isConnected || !!readyGameList.length || !!waitingGameList.length}
          onClick={() => {
            setIsModalOpen(true);
          }}
          className='btn btn-success'
        >
          New Game
        </button>
      </div>
      <NewGameModal
        handleSubmit={async (gameName, questionCount) => {
          sendPlayerCreateGame(gameName, questionCount);
          await updateGameList();
        }}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default observer(LandingPage);

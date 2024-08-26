export default interface LobbyGame {
  id: string;
  name: string;
  questionCount: number;
  state: 'waiting' | 'countdown' | 'question' | 'ended';
}

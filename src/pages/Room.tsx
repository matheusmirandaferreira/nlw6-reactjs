import { useEffect } from 'react';
import { FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';
import logoImg from '../assets/images/logo.svg';
import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';

import '../styles/room.scss';

type FirebaseQuestions = Record<
  string,
  {
    author: {
      nome: string;
      avatar: string;
    };
    content: string;
    isAnswere: boolean;
    isHighlighted: boolean;
  }
>;

type Question = {
  id: string;
  author: {
    nome: string;
    avatar: string;
  };
  content: string;
  isAnswere: boolean;
  isHighlighted: boolean;
};

type RoomParams = {
  id: string;
};

export function Room() {
  const { user } = useAuth();
  const params = useParams<RoomParams>();
  const [newQuestion, setNewQuestion] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const roomRef = database.ref(`rooms/${params.id}`);

    roomRef.once('value', (room) => {
      const databaseRoom = room.val();
      const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {};

      const parseQuestions = Object.entries(firebaseQuestions).map(
        ([key, value]) => {
          return {
            id: key,
            content: value.content,
            author: value.author,
            isHighlighted: value.isHighlighted,
            isAnswere: value.isAnswere,
          };
        }
      );
      console.log(parseQuestions);
      setTitle(databaseRoom.title);
      setQuestions(parseQuestions);
    });
  }, [params.id]);

  async function handleSendQuestion(event: FormEvent) {
    event.preventDefault();

    if (newQuestion.trim() === '') {
      return;
    }

    if (!user) {
      throw new Error('You must be logged in');
    }

    const question = {
      content: newQuestion,
      author: {
        name: user.name,
        avatar: user.avatar,
      },
      isHighlighted: false,
      isAnswered: false,
    };

    await database.ref(`rooms/${params.id}/questions`).push(question);

    setNewQuestion('');
  }
  return (
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="Logo" />
          <RoomCode code={params.id} />
        </div>
      </header>

      <main className="content">
        <div className="room-title">
          <h1>Sala {title}</h1>
          {questions && <span>{questions.length} pergunta(s)</span>}
        </div>

        <form onSubmit={handleSendQuestion}>
          <textarea
            onChange={(e) => setNewQuestion(e.target.value)}
            value={newQuestion}
            placeholder="O que você quer perguntar ?"
          />

          <div className="form-footer">
            {!user ? (
              <span>
                Para enviar uma pergunta, <button>faça seu login</button>.
              </span>
            ) : (
              <div className="user-info">
                <img src={user.avatar} alt={user.name} />
                <span>{user.name}</span>
              </div>
            )}
            <Button disabled={!user} type="submit">
              Enviar pergunta
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

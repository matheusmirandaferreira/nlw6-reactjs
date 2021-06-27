import { useHistory, useParams } from 'react-router-dom';
import logoImg from '../assets/images/logo.svg';
import deleteImg from '../assets/images/delete.svg';
import { Button } from '../components/Button';
import { Question } from '../components/Question';
import { RoomCode } from '../components/RoomCode';
import { useRoom } from '../hooks/useRoom';

import '../styles/room.scss';
import { database } from '../services/firebase';

type RoomParams = {
  id: string;
};

export function AdminRoom() {
  const params = useParams<RoomParams>();
  const history = useHistory();
  const { title, questions } = useRoom(params.id);

  async function handleEndRoom() {
    await database.ref(`rooms/${params.id}`).update({
      endedAt: new Date(),
    });

    history.push('/');
  }

  async function handleDeleteQuestion(questionId: string) {
    if (window.confirm('Tem certeza que você deseja deletar está pergunta ?')) {
      await database.ref(`rooms/${params.id}/questions/${questionId}`).remove();
    }
  }

  return (
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="Logo" />
          <div>
            <RoomCode code={params.id} />
            <Button onClick={handleEndRoom} isOutlined>
              Encerrar sala
            </Button>
          </div>
        </div>
      </header>

      <main className="content">
        <div className="room-title">
          <h1>Sala {title}</h1>
          {questions && <span>{questions.length} pergunta(s)</span>}
        </div>

        <div className="question-list">
          {questions.map((question) => {
            return (
              <Question
                key={question.id}
                content={question.content}
                author={question.author}
              >
                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(question.id)}
                >
                  <img src={deleteImg} alt="Deletar questão" />
                </button>
              </Question>
            );
          })}
        </div>
      </main>
    </div>
  );
}

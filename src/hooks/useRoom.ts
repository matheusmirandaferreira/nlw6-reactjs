import { useEffect, useState } from "react";
import { database } from "../services/firebase";
import { useAuth } from "./useAuth";


type QuestionProps = {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  isAnswere: boolean;
  isHighlighted: boolean;
  likeCount: number;
  likeId?: string;
};

type FirebaseQuestions = Record<
  string,
  {
    author: {
      name: string;
      avatar: string;
    };
    content: string;
    isAnswere: boolean;
    isHighlighted: boolean;
    likes: Record<string, { authorId: string }>;
  }
>;


export function useRoom(roomId: string) {
  const { user } = useAuth()
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<QuestionProps[]>([]);

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);

    roomRef.on('value', (room) => {
      const databaseRoom = room.val();
      const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {};

      const parseQuestions = Object.entries(firebaseQuestions).map(
        ([key, value]) => {
          return {
            id: key,
            author: value.author,
            content: value.content,
            isAnswere: value.isAnswere,
            isHighlighted: value.isHighlighted,
            likeCount: Object.values(value.likes ?? {}).length,
            likeId: Object.entries(value.likes ?? {}).find(([key, like]) => like.authorId === user?.id)?.[0],
          };
        }
      );
      setTitle(databaseRoom.title);
      setQuestions(parseQuestions);
    });

    return () => {
      roomRef.off('value');
    }
  }, [roomId, user?.id]);

  return { title, questions }
}
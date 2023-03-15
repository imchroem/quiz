import { useCallback } from "react";

import { ContextFunc, ContextReturn, useFetchDelete, useFetchGet, useFetchPost, useFetchPut } from "./FetchHelper";
import { QuizGame } from "../model/QuizGame";
import { Quiz } from "../model/Quiz";

type CreateGameDto = Omit<QuizGame,"id"|"quizzes">;
type UpdateGameDto = Omit<QuizGame,"quizzes">;
type CreateQuizDto = Omit<Quiz, "id">;

interface IQuizGameContext{
    useAllGames: ContextFunc<QuizGame[]>;
    useGame: ContextFunc<QuizGame, string>;
    useDeleteGame: ContextFunc<QuizGame, string>;
    useUpdateGame: ContextFunc<QuizGame, string, UpdateGameDto>;
    useCreateGame: ContextFunc<QuizGame, CreateGameDto>;

    useCreateQuiz: ContextFunc<QuizGame, string, CreateQuizDto>;
    useUpdateQuiz: ContextFunc<QuizGame, string, string, Quiz>;
    useRemoveQuiz: ContextFunc<QuizGame, string, string>;
}

const baseRoute = '/api/game';

export const QuizGameContext: IQuizGameContext = {
    useAllGames: (): ContextReturn<QuizGame[]> => {
        const [rawInvoke, loading, error] = useFetchGet<QuizGame[]>();
        const invoke = useCallback(() => rawInvoke(baseRoute), [rawInvoke]);
        return [invoke, loading, error];
    },
    useGame: (): ContextReturn<QuizGame, string> => {
        const [rawInvoke, loading, error] = useFetchGet<QuizGame>();
        const invoke = useCallback((gameId: string) => rawInvoke(`${baseRoute}/${gameId}`), [rawInvoke]);
        return [invoke, loading, error];
    },
    useDeleteGame: (): ContextReturn<QuizGame, string> => {
        const [rawInvoke, loading, error] = useFetchDelete<QuizGame>();
        const invoke = useCallback((gameId: string) => rawInvoke(`${baseRoute}/${gameId}`), [rawInvoke]);
        return [invoke, loading, error];
    },
    useUpdateGame: (): ContextReturn<QuizGame, string, UpdateGameDto> => {
        const [rawInvoke, loading, error] = useFetchPut<QuizGame>();
        const invoke = useCallback((gameId: string, model: UpdateGameDto) => rawInvoke(`${baseRoute}/${gameId}`, model), [rawInvoke]);
        return [invoke, loading, error];
    },
    useCreateGame: (): ContextReturn<QuizGame, CreateGameDto> => {
        const [rawInvoke, loading, error] = useFetchPost<QuizGame>();
        const invoke = useCallback((model: CreateGameDto) => rawInvoke(baseRoute, model), [rawInvoke]);
        return [invoke, loading, error];
    },

    useCreateQuiz: function (): ContextReturn<QuizGame, string, CreateQuizDto> {
        const [rawInvoke, loading, error] = useFetchPost<QuizGame>();
        const invoke = useCallback((gameId: string, model: CreateQuizDto) => rawInvoke(`${baseRoute}/${gameId}/quiz`, model), [rawInvoke]);
        return [invoke, loading, error];
    },
    useUpdateQuiz: function (): ContextReturn<QuizGame, string, string, Quiz> {
        const [rawInvoke, loading, error] = useFetchPut<QuizGame>();
        const invoke = useCallback((gameId: string, quizId: string, model: CreateQuizDto) => rawInvoke(`${baseRoute}/${gameId}/quiz/${quizId}`, model), [rawInvoke]);
        return [invoke, loading, error];
    },
    useRemoveQuiz: function (): ContextReturn<QuizGame, string, string> {
        const [rawInvoke, loading, error] = useFetchDelete<QuizGame>();
        const invoke = useCallback((gameId: string, quizId: string) => rawInvoke(`${baseRoute}/${gameId}/quiz/${quizId}`), [rawInvoke]);
        return [invoke, loading, error];
    }
}
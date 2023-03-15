/*
 *
 * No need to touch this file.
 *
 */

import { useCallback, useState } from "react";
import { Quiz } from "../model/Quiz";
import { QuizGame } from "../model/QuizGame";

export class FetchError extends Error {
    public isFetchError: boolean;
    public status: number;
    public isJson: boolean;
    public body?: { [key: string]: string[] };

    constructor(status: number, statusText: string, isJson: boolean, body?: { [key: string]: string[] }) {
        super(statusText);
        this.status = status;
        this.isJson = isJson;
        this.body = body;
        this.isFetchError = true;
    }

    toString() {
        return JSON.stringify({ status: this.status, isJson: this.isJson, body: this.body });
    }
}

export type ContextReturn<T,T2=void,T3=void,T4=void,T5=void> = [
    (a: T2, a2: T3, a3: T4, a4: T5) => Promise<T>,
    boolean,
    FetchError|undefined
]
export type ContextFunc<T,T2=void,T3=void,T4=void,T5=void> = () => ContextReturn<T,T2,T3,T4,T5>;

type UseFetchResult<T> = [
    (id?: string, body?: unknown) => Promise<T>,
    boolean,
    FetchError | undefined
];

export const useFetchGet = <T,> () => useFetch<T>('GET');
export const useFetchPut = <T,> () => useFetch<T>('PUT');
export const useFetchPost = <T,> () => useFetch<T>('POST');
export const useFetchDelete = <T,> () => useFetch<T>('DELETE');


const useFetch = <T,> (method: 'GET' | 'POST' | 'DELETE' | 'PUT'): UseFetchResult<T> => {
    const [loading, setLoading] = useState(() => false);
    const [error, setError] = useState<FetchError>();

    //make sure invoke function will only be created once
    const invoke = useCallback(async (id?: string, body?: unknown): Promise<T> => {
        setLoading(true);
        setError(undefined);
        try {
            const promise = await fireRequest<T>(method, id || '', body);
            await promise;
            setLoading(false)
            setError(undefined);
            return promise;
        }
        catch (e: unknown) {
            setLoading(false);
            if(e instanceof FetchError){
                setError(e);
            } 
            else{
                setError(new FetchError(1, "Unknown error", false));
            }
        }
        return new Promise<T>(() => {});
    }, [method]);

    return [invoke, loading, error];
}


const delay = () => new Promise((r) => setTimeout(r, Math.random() * 2000));
const fireRequest = async <T,> (method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, body?: unknown): Promise<T> => {
    await delay();
    const parts = url.split("/").filter(x => x);
    if(parts.length < 2) throw new FetchError(404, `route not found: ${url}`, false);
    if(parts[0] === "api" && parts[1] === "game"){
        //Quiz endpoint
        if(parts.length > 3 && parts[3] === "quiz"){
            const gameId = parts[2];
            const quizId = parts.length > 4 ? parts[4] : '';
            if (method === 'POST') {
                return _createQuiz(gameId, body) as T;
            }
            else if (method === 'PUT') {
                return _updateQuiz(gameId, quizId, body) as T;
            }
            else if (method === 'DELETE') {
                return _removeQuiz(gameId, quizId) as T;
            }
            else {
                throw new Error(`Unsupport HTTP Verb ${method}`);
            }
        }
        //game endpoint
        else{
            const id = parts.length > 2 ? parts[2] : '';
            if (method === 'GET') {
                return _read(id) as T;
            }
            else if (method === 'POST') {
                return _create(body) as T;
            }
            else if (method === 'PUT') {
                return _update(id, body) as T;
            }
            else if (method === 'DELETE') {
                return _remove(id) as T;
            }
            else {
                throw new Error(`Unsupport HTTP Verb ${method}`);
            }
        } 
    }
    throw new FetchError(404, `route not found: ${url}`, false);
}



let quizGames: QuizGame[] = JSON.parse(localStorage.getItem("database") ?? "[]");

const _create = (model: unknown) => {
    if(!isQuizGame(model)) throw new FetchError(400, "Bad request", false);
    const q = {...model, id: crypto.randomUUID(), quizzes: []};
    quizGames = [...quizGames, q]; 
    updateLocaleStorage();
    return q;
}
const _read = (id: string) => {
    if(!id) return quizGames.map(x => ({...x, quizzes: x.quizzes ?? []}));
    const game = quizGames.find(x => x.id === id);
    if(game){
        return {...game, quizzes: game.quizzes ?? []};
    }
    else{
        throw new FetchError(404, "Not Found", false);
    }
}
const _update = (id: string, model: unknown) => {
    if(!isQuizGame(model)) throw new FetchError(400, "Bad request", false);
    quizGames = quizGames.map(x => x.id === id ? {...x, ...model, quizzes: x.quizzes} : x);
    updateLocaleStorage();
    return _read(id);
} 
const _remove = (id: string) => {
    const game = _read(id);
    quizGames = quizGames.filter(x => x.id !== id);
    updateLocaleStorage();
    return game;
}

const _createQuiz = (id: string, model: unknown) => {
    if(!isQuiz(model)){
        throw new FetchError(400, "Bad request", true, {});
    } 
    const game = _read(id) as QuizGame;
    game.quizzes = [...game.quizzes, {...model, id: crypto.randomUUID()}];
    quizGames = quizGames.map(x => x.id === id ? game : x);
    updateLocaleStorage();
    return game;
}

const _updateQuiz = (id: string, quizId: string, model: unknown) => {
    if(!isQuiz(model)){
        throw new FetchError(400, "Bad request", true, {});
    } 
    const game = _read(id) as QuizGame;
    game.quizzes = game.quizzes.map(x => x.id === quizId ? {...model, id: quizId} : x);
    quizGames = quizGames.map(x => x.id === id ? game : x);
    updateLocaleStorage();
    return game;
}

const _removeQuiz = (id: string, quizId: string) => {
    const game = _read(id) as QuizGame;
    game.quizzes = game.quizzes.filter(x => x.id !== quizId);
    quizGames = quizGames.map(x => x.id === id ? game : x);
    updateLocaleStorage();
    return game;
}

const updateLocaleStorage = () => localStorage.setItem("database", JSON.stringify(quizGames));


const isQuizGame = (model: unknown): model is QuizGame => {
    return !!(model instanceof Object) &&
        "name" in model &&
        "description" in model;
}

const isQuiz = (model: unknown): model is Quiz => {
    return !!(model instanceof Object) &&
        "question" in model &&
        "answers" in model;
}
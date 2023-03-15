import { Quiz } from "./Quiz";

export interface QuizGame{
    id: string;
    name: string;
    description: string;
    quizzes: Quiz[];
}
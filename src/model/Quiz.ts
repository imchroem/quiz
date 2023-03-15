import { TextType } from "./TextType";

export interface Quiz{
    id: string;
    question: Question;
    answers: Answer[];
}

export interface Question{
    text: TextType;
}

export interface Answer{
    text: TextType;
    correct: boolean;
}
import React, { useState } from 'react';
import { QuizGameContext } from './NoNeedToTouch/QuizGameContext';
import './App.css';
import { QuizGame } from './model/QuizGame';


const randomName = (prefix: string) => `${prefix} ${Math.round(Math.random() * 1000000)}`;

const randomGame = () => ({
    name: randomName("Game"),
    description: "This is a quiz game about star-wars!"
})

const randomQuiz = () => ({
  id: `${Math.random()
    .toString(36)
    .substring(2, 11)}` /* add a random unique id */,
  question: {
    text: { content: randomName("Question"), fontSize: 14, textColor: "#000" }
  },
  answers: [
    { text: { content: "Yes", fontSize: 14, textColor: "#FFF" }, correct: true },
    { text: { content: "No", fontSize: 14, textColor: "#FFF" }, correct: false }
  ]
});

const App = () => {
    const [getAll, loadingGetAll, errorGetAll] = QuizGameContext.useAllGames();
    const [get, loadingGet, errorGet] = QuizGameContext.useGame();
    const [remove, loadingremove, errorRemove] = QuizGameContext.useDeleteGame();
    const [create, loadingCreate, errorCreate] = QuizGameContext.useCreateGame();
    const [update, loadingUpdate, errorUpdate] = QuizGameContext.useUpdateGame();
    const [createQuiz, loadingCreateQuiz, errorCreateQuiz] = QuizGameContext.useCreateQuiz();
    const [removeQuiz, loadingRemoveQuiz, errorRemoveQuiz] = QuizGameContext.useRemoveQuiz();

    const loading = loadingGetAll || loadingGet || loadingremove || loadingCreate || loadingUpdate || loadingCreateQuiz || loadingRemoveQuiz;
    const error = errorGetAll || errorGet || errorRemove || errorCreate || errorUpdate || errorCreateQuiz || errorRemoveQuiz;

    const [games, setGames] = useState<QuizGame[]>([]);

    return (
        <div className="App">
            <div>
                <button onClick={() => create(randomGame()).then(x => setGames(g => [...g, x]))}>
                    Create game
                </button>
                <button onClick={() => get("04a67d89-6748-4f62-824d-ae777a99b113").then(x => setGames(g => [...g, x]))}>
                    Fetch game
                </button>
                <button onClick={() => getAll().then(setGames)}>Fetch All games</button>

                <div>
                    <h1>Games</h1>
                  
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  {games.map(x =>
    <div className="games" key={x.id}>
      <span style={{ display: 'block' }}>
        <b>Game name</b>: {x.name}
      </span>
      <span style={{ display: 'block' }}>
        <b>Amount of questions</b>: {x.quizzes?.length ?? 0}
      </span>
      <button onClick={() => remove(x.id).then(() => setGames(g => g.filter(y => y.id !== x.id)))}>Delete game</button>
      <button onClick={() => update(x.id, { ...x, name: randomName("Game") }).then((updatedGame) => setGames(g => g.map(y => y.id !== updatedGame.id ? y : updatedGame)))}>Update Game Name</button>
      <button onClick={() => createQuiz(x.id, randomQuiz()).then((updatedGame) => setGames(g => g.map(y => y.id !== updatedGame.id ? y : updatedGame)))}>Add question</button>
      
{/* Check if there is more than 1 quiz in the array */}
{x.quizzes.length > 0 && (
  <>
    
    {/* Render each quiz */}
    {x.quizzes.map(q =>
      <div key={q.question.text.content}>
        <p className='question'>{q.question.text.content}</p>
        {q.answers.map(a =>
          <p key={a.text.content} className="answers" style={{ textDecoration: a.correct ? 'underline' : 'none', color: a.correct ? 'green' : 'red'}}>
            {a.text.content}{a.correct ? ' (correct)' : ''}
          </p>
        )}
      </div>
    )}

    {/* Add some spacing between quizzes */}
    <br />
  </>
)}
      
      {/* Add the remove quiz button if there is at least 1 quiz in the array */}
      {x.quizzes.length > 0 && (
        <button onClick={() => removeQuiz(x.id, x.quizzes[0].id).then((updatedGame) => setGames(g => g.map(y => y.id !== updatedGame.id ? y : updatedGame)))}>
          Remove Question
        </button>
      )}
    </div>
  )}
</div>

                    {games.length === 0 && "No games.."}
                    <h2>
                        {loading && "Loading..."}
                        {error && `${error.status} ${error.message}`}
                    </h2>
                </div>
            </div>
        </div>
    );
}

export default App;

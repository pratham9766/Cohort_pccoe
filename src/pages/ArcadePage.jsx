import { CheckCircle2, Gamepad2, RotateCcw, Timer, Trophy, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';

const quizQuestions = [
  {
    question: 'Which club is best suited for product-building workshops?',
    answers: ['GDGC PCCOE', 'Sports Council', 'Art Circle'],
    correct: 'GDGC PCCOE',
  },
  {
    question: 'Where should students look for campus deadlines?',
    answers: ['c/calendar', 'c/maps', 'c/connect'],
    correct: 'c/calendar',
  },
  {
    question: 'Which feature is meant for anonymous campus exchange?',
    answers: ['XD', 'HeadsUp', 'Profile'],
    correct: 'XD',
  },
];

const memorySeed = ['GDGC', 'NSS', 'ACM', 'E-Cell', 'GDGC', 'NSS', 'ACM', 'E-Cell'];

export default function ArcadePage() {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [streak, setStreak] = useState(0);
  const question = quizQuestions[questionIndex];

  const memoryCards = useMemo(
    () => memorySeed.map((label, index) => ({ id: `${label}-${index}`, label })),
    [],
  );

  const pickAnswer = (answer) => {
    setSelectedAnswer(answer);
    if (answer === question.correct) {
      setScore((current) => current + 10);
      setStreak((current) => current + 1);
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer('');
    setQuestionIndex((current) => (current + 1) % quizQuestions.length);
  };

  const flipCard = (card) => {
    if (matched.includes(card.label) || flipped.some((item) => item.id === card.id) || flipped.length === 2) return;
    const nextFlipped = [...flipped, card];
    setFlipped(nextFlipped);
    if (nextFlipped.length === 2) {
      if (nextFlipped[0].label === nextFlipped[1].label) {
        setMatched((current) => [...current, card.label]);
        setScore((current) => current + 15);
        setFlipped([]);
      } else {
        window.setTimeout(() => setFlipped([]), 700);
      }
    }
  };

  const resetArcade = () => {
    setSelectedAnswer('');
    setScore(0);
    setQuestionIndex(0);
    setFlipped([]);
    setMatched([]);
    setStreak(0);
  };

  return (
    <section className="page stack">
      <div className="page-header">
        <div>
          <h1 className="page-title">c/arcade</h1>
          <p className="muted">Quick campus games for breaks between lectures.</p>
        </div>
        <Button variant="ghost" icon={RotateCcw} onClick={resetArcade}>
          Reset
        </Button>
      </div>

      <div className="arcade-score-strip">
        <Card>
          <Trophy size={20} aria-hidden="true" />
          <span>Score</span>
          <strong>{score}</strong>
        </Card>
        <Card>
          <Zap size={20} aria-hidden="true" />
          <span>Streak</span>
          <strong>{streak}</strong>
        </Card>
        <Card>
          <Timer size={20} aria-hidden="true" />
          <span>Matches</span>
          <strong>{matched.length}/4</strong>
        </Card>
      </div>

      <div className="arcade-layout">
        <Card className="stack arcade-panel">
          <h2>
            <Gamepad2 size={20} aria-hidden="true" />
            Campus Quiz
          </h2>
          <p>{question.question}</p>
          <div className="arcade-answer-grid">
            {question.answers.map((answer) => (
              <button
                type="button"
                key={answer}
                className={selectedAnswer === answer ? 'selected' : ''}
                disabled={Boolean(selectedAnswer)}
                onClick={() => pickAnswer(answer)}
              >
                {answer}
              </button>
            ))}
          </div>
          {selectedAnswer ? (
            <div className="arcade-result">
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>{selectedAnswer === question.correct ? 'Correct answer' : `Correct: ${question.correct}`}</span>
              <Button variant="ghost" onClick={nextQuestion}>Next</Button>
            </div>
          ) : null}
        </Card>

        <Card className="stack arcade-panel">
          <h2>Club Memory</h2>
          <div className="memory-grid">
            {memoryCards.map((card) => {
              const isOpen = matched.includes(card.label) || flipped.some((item) => item.id === card.id);
              return (
                <button type="button" key={card.id} className={isOpen ? 'open' : ''} onClick={() => flipCard(card)}>
                  {isOpen ? card.label : '?'}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </section>
  );
}

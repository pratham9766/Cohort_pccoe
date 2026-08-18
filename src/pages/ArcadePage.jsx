import { Chess } from 'chess.js';
import { Crown, Grid3X3, Puzzle, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button.jsx';
import { Card } from '@/components/ui/Card.jsx';

const games = [
  { key: 'chess', title: 'Chess', description: 'You vs Buddy AI.', icon: Crown },
  { key: 'tic-tac-toe', title: 'Tic-Tac-Toe', description: 'Play against Buddy AI.', icon: Grid3X3 },
  { key: 'sudoku', title: 'Sudoku', description: 'Fill the 9x9 grid.', icon: Puzzle },
];

const chessFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const chessPieces = {
  wp: '♙',
  wn: '♘',
  wb: '♗',
  wr: '♖',
  wq: '♕',
  wk: '♔',
  bp: '♟',
  bn: '♞',
  bb: '♝',
  br: '♜',
  bq: '♛',
  bk: '♚',
};

const sudokuPuzzle = [
  [0, 0, 0, 7, 0, 0, 5, 0, 3],
  [5, 2, 3, 9, 6, 0, 4, 0, 0],
  [4, 0, 0, 0, 5, 0, 0, 9, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 5],
  [7, 0, 0, 0, 0, 6, 0, 0, 0],
  [9, 0, 0, 0, 7, 0, 2, 3, 0],
  [0, 0, 0, 4, 1, 0, 8, 0, 2],
  [0, 0, 7, 0, 0, 0, 0, 6, 0],
  [0, 0, 2, 6, 3, 0, 0, 4, 7],
];

const sudokuSolution = [
  [6, 8, 9, 7, 4, 2, 5, 1, 3],
  [5, 2, 3, 9, 6, 1, 4, 7, 8],
  [4, 7, 1, 8, 5, 3, 6, 9, 2],
  [2, 3, 6, 1, 8, 4, 7, 5, 9],
  [7, 1, 5, 3, 9, 6, 2, 8, 4],
  [9, 4, 8, 5, 7, 2, 1, 3, 6],
  [3, 6, 4, 2, 1, 7, 8, 9, 5],
  [1, 5, 7, 4, 2, 9, 3, 6, 8],
  [8, 9, 2, 6, 3, 5, 1, 4, 7],
];

function createSudokuGrid() {
  return sudokuPuzzle.map((row) => row.map((value) => (value ? String(value) : '')));
}

function chessStatus(chess, playerColor) {
  const player = playerColor === 'w' ? 'White' : 'Black';
  const buddy = playerColor === 'w' ? 'Black' : 'White';
  if (chess.isCheckmate()) return chess.turn() === playerColor ? 'Buddy AI wins by checkmate.' : 'You win by checkmate.';
  if (chess.isDraw()) return 'Draw.';
  if (chess.isCheck()) return `${chess.turn() === playerColor ? player : buddy} is in check.`;
  return chess.turn() === playerColor ? 'Your turn' : 'Buddy AI thinking...';
}

function pickChessMove(chess) {
  const moves = chess.moves({ verbose: true });
  const captures = moves.filter((move) => move.captured);
  const checks = moves.filter((move) => move.san.includes('+') || move.san.includes('#'));
  const candidates = checks.length ? checks : captures.length ? captures : moves;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function getWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  const win = lines.find(([a, b, c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
  if (win) return board[win[0]];
  if (board.every(Boolean)) return 'draw';
  return null;
}

function chooseTicTacToeMove(board, aiMark, playerMark) {
  const empty = board.map((cell, index) => (cell ? null : index)).filter((index) => index !== null);
  const winningMove = empty.find((index) => getWinner(board.map((cell, cellIndex) => (cellIndex === index ? aiMark : cell))) === aiMark);
  if (winningMove !== undefined) return winningMove;
  const blockingMove = empty.find(
    (index) => getWinner(board.map((cell, cellIndex) => (cellIndex === index ? playerMark : cell))) === playerMark,
  );
  if (blockingMove !== undefined) return blockingMove;
  if (empty.includes(4)) return 4;
  const corners = empty.filter((index) => [0, 2, 6, 8].includes(index));
  return (corners.length ? corners : empty)[0];
}

function sudokuComplete(grid) {
  return grid.every((row, rowIndex) =>
    row.every((value, columnIndex) => Number(value) === sudokuSolution[rowIndex][columnIndex]),
  );
}

export default function ArcadePage() {
  const [activeGame, setActiveGame] = useState('chess');
  const [chessFen, setChessFen] = useState('start');
  const [selectedSquare, setSelectedSquare] = useState('');
  const [playerColor, setPlayerColor] = useState('w');
  const [ticTacToeBoard, setTicTacToeBoard] = useState(Array(9).fill(''));
  const [playerMark, setPlayerMark] = useState('X');
  const [sudokuGrid, setSudokuGrid] = useState(() => createSudokuGrid());
  const [selectedCell, setSelectedCell] = useState({ row: 0, column: 0 });
  const [showMistakes, setShowMistakes] = useState(false);

  const chess = useMemo(() => (chessFen === 'start' ? new Chess() : new Chess(chessFen)), [chessFen]);
  const chessBoard = chess.board();
  const legalTargets = selectedSquare
    ? chess.moves({ square: selectedSquare, verbose: true }).map((move) => move.to)
    : [];
  const aiMark = playerMark === 'X' ? 'O' : 'X';
  const ticTacToeWinner = getWinner(ticTacToeBoard);

  useEffect(() => {
    if (activeGame !== 'chess' || chess.isGameOver() || chess.turn() === playerColor) return;
    const timer = window.setTimeout(() => {
      const nextChess = chessFen === 'start' ? new Chess() : new Chess(chessFen);
      const move = pickChessMove(nextChess);
      if (move) {
        nextChess.move({ from: move.from, to: move.to, promotion: 'q' });
        setChessFen(nextChess.fen());
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [activeGame, chess, chessFen, playerColor]);

  useEffect(() => {
    if (activeGame !== 'tic-tac-toe' || ticTacToeWinner) return;
    const xCount = ticTacToeBoard.filter((cell) => cell === 'X').length;
    const oCount = ticTacToeBoard.filter((cell) => cell === 'O').length;
    const currentTurn = xCount === oCount ? 'X' : 'O';
    if (currentTurn === playerMark) return;

    const timer = window.setTimeout(() => {
      setTicTacToeBoard((board) => {
        if (getWinner(board)) return board;
        const index = chooseTicTacToeMove(board, aiMark, playerMark);
        return board.map((cell, cellIndex) => (cellIndex === index ? aiMark : cell));
      });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [activeGame, aiMark, playerMark, ticTacToeBoard, ticTacToeWinner]);

  const resetChess = (color = playerColor) => {
    setPlayerColor(color);
    setChessFen('start');
    setSelectedSquare('');
  };

  const moveChessPiece = (square, piece) => {
    if (chess.isGameOver() || chess.turn() !== playerColor) return;
    if (!selectedSquare) {
      if (piece?.color === playerColor) setSelectedSquare(square);
      return;
    }
    if (selectedSquare === square) {
      setSelectedSquare('');
      return;
    }
    const targetOwnPiece = piece?.color === playerColor;
    const move = chess.move({ from: selectedSquare, to: square, promotion: 'q' });
    if (move) {
      setChessFen(chess.fen());
      setSelectedSquare('');
    } else {
      setSelectedSquare(targetOwnPiece ? square : '');
    }
  };

  const resetTicTacToe = (mark = playerMark) => {
    setPlayerMark(mark);
    setTicTacToeBoard(Array(9).fill(''));
  };

  const playTicTacToe = (index) => {
    if (ticTacToeWinner || ticTacToeBoard[index]) return;
    const xCount = ticTacToeBoard.filter((cell) => cell === 'X').length;
    const oCount = ticTacToeBoard.filter((cell) => cell === 'O').length;
    const currentTurn = xCount === oCount ? 'X' : 'O';
    if (currentTurn !== playerMark) return;
    setTicTacToeBoard((board) => board.map((cell, cellIndex) => (cellIndex === index ? playerMark : cell)));
  };

  const setSudokuValue = (value) => {
    const { row, column } = selectedCell;
    if (sudokuPuzzle[row][column]) return;
    setSudokuGrid((grid) =>
      grid.map((gridRow, rowIndex) =>
        gridRow.map((cell, columnIndex) => (rowIndex === row && columnIndex === column ? value : cell)),
      ),
    );
  };

  const resetSudoku = () => {
    setSudokuGrid(createSudokuGrid());
    setSelectedCell({ row: 0, column: 0 });
    setShowMistakes(false);
  };

  return (
    <section className="page stack arcade-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">c/arcade</h1>
          <p className="muted">Quick browser games you can play inside cohort.</p>
        </div>
      </div>

      <div className="arcade-game-picker" role="tablist" aria-label="Arcade games">
        {games.map((game) => {
          const Icon = game.icon;
          const isActive = activeGame === game.key;
          return (
            <button
              type="button"
              key={game.key}
              className={isActive ? 'active' : ''}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveGame(game.key)}
            >
              <span>
                <Icon size={18} aria-hidden="true" />
                <strong>{game.title}</strong>
              </span>
              <small>{game.description}</small>
            </button>
          );
        })}
      </div>

      <Button variant="ghost" className="arcade-more-button" disabled>
        More games coming soon!
      </Button>

      <Card className="arcade-play-surface">
        {activeGame === 'chess' ? (
          <>
            <div className="arcade-play-header">
              <p>
                You are <strong>{playerColor === 'w' ? 'White' : 'Black'}</strong>. Buddy AI is{' '}
                <strong>{playerColor === 'w' ? 'Black' : 'White'}</strong>.
              </p>
              <div className="arcade-control-row">
                <Button onClick={() => resetChess('w')}>Play White</Button>
                <Button variant="ghost" onClick={() => resetChess('b')}>Play Black</Button>
                <Button icon={RotateCcw} onClick={() => resetChess()}>Reset board</Button>
              </div>
            </div>
            <p className="arcade-turn-label">{chessStatus(chess, playerColor)}</p>
            <div className="chess-board playable-chess-board" aria-label="Chess board">
              {chessBoard.map((row, rowIndex) =>
                row.map((piece, columnIndex) => {
                  const displayRow = playerColor === 'w' ? rowIndex : 7 - rowIndex;
                  const displayColumn = playerColor === 'w' ? columnIndex : 7 - columnIndex;
                  const displayPiece = chessBoard[displayRow][displayColumn];
                  const square = `${chessFiles[displayColumn]}${8 - displayRow}`;
                  const isDark = (displayRow + displayColumn) % 2 === 1;
                  const isSelected = selectedSquare === square;
                  const isLegalTarget = legalTargets.includes(square);

                  return (
                    <button
                      type="button"
                      key={`${rowIndex}-${columnIndex}`}
                      className={[
                        'chess-square',
                        isDark ? 'dark' : 'light',
                        isSelected ? 'selected' : '',
                        isLegalTarget ? 'target' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => moveChessPiece(square, displayPiece)}
                    >
                      {displayPiece ? (
                        <span className={`chess-symbol ${displayPiece.color === 'w' ? 'white' : 'black'}`}>
                          {chessPieces[`${displayPiece.color}${displayPiece.type}`]}
                        </span>
                      ) : null}
                    </button>
                  );
                }),
              )}
            </div>
            <small className="muted">Current chess mode supports castling, core movement, captures, and pawn promotion to queen.</small>
          </>
        ) : null}

        {activeGame === 'tic-tac-toe' ? (
          <>
            <div className="arcade-play-header">
              <p>
                You are <strong className="mark-x">{playerMark}</strong>. Buddy AI is{' '}
                <strong className="mark-o">{aiMark}</strong>.
              </p>
              <div className="arcade-control-row">
                <Button onClick={() => resetTicTacToe('X')}>Play X</Button>
                <Button variant="ghost" onClick={() => resetTicTacToe('O')}>Play O</Button>
                <Button icon={RotateCcw} onClick={() => resetTicTacToe()}>Reset game</Button>
              </div>
            </div>
            <p className="arcade-turn-label">
              {ticTacToeWinner === 'draw'
                ? 'Draw.'
                : ticTacToeWinner
                  ? ticTacToeWinner === playerMark ? 'You win.' : 'Buddy AI wins.'
                  : 'Your turn'}
            </p>
            <div className="tic-tac-toe-board" aria-label="Tic-Tac-Toe board">
              {ticTacToeBoard.map((cell, index) => (
                <button type="button" key={index} onClick={() => playTicTacToe(index)} className={cell ? `filled ${cell}` : ''}>
                  {cell}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {activeGame === 'sudoku' ? (
          <>
            <div className="arcade-play-header">
              <p>Tip: press Check mistakes anytime.</p>
              <div className="arcade-control-row">
                <Button variant="ghost" onClick={() => setShowMistakes((current) => !current)}>Check mistakes</Button>
                <Button onClick={resetSudoku}>New puzzle</Button>
              </div>
            </div>
            <p className="arcade-turn-label">{sudokuComplete(sudokuGrid) ? 'Solved.' : 'Select a square, then choose a number.'}</p>
            <div className="sudoku-board playable-sudoku-board" aria-label="Sudoku board">
              {sudokuGrid.map((row, rowIndex) =>
                row.map((value, columnIndex) => {
                  const isGiven = Boolean(sudokuPuzzle[rowIndex][columnIndex]);
                  const isSelected = selectedCell.row === rowIndex && selectedCell.column === columnIndex;
                  const isMistake = showMistakes && value && Number(value) !== sudokuSolution[rowIndex][columnIndex];
                  return (
                    <button
                      type="button"
                      key={`${rowIndex}-${columnIndex}`}
                      className={['sudoku-cell', isGiven ? 'given' : '', isSelected ? 'selected' : '', isMistake ? 'conflict' : '']
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => setSelectedCell({ row: rowIndex, column: columnIndex })}
                    >
                      {value}
                    </button>
                  );
                }),
              )}
            </div>
            <div className="sudoku-keypad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                <button type="button" key={number} onClick={() => setSudokuValue(String(number))}>
                  {number}
                </button>
              ))}
              <button type="button" onClick={() => setSudokuValue('')}>Clear</button>
            </div>
          </>
        ) : null}
      </Card>
    </section>
  );
}

'use client';
import { useState, useEffect } from 'react';
import { generateSudoku } from './utils/sudoku';
import Confetti from './components/Confetti';

function DifficultySelector({ difficulty, onSelect }) {
  const [showOptions, setShowOptions] = useState(false);
  const difficulties = Array.from({ length: 10 }, (_, i) => i + 1);
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold 
          py-2 px-4 rounded flex items-center gap-2 transition-colors duration-200
          border border-gray-300"
      >
        <span>Level {difficulty}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${showOptions ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showOptions && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded shadow-lg
          border border-gray-200 py-2 z-50">
          {difficulties.map(level => (
            <button
              key={level}
              onClick={() => {
                onSelect(level);
                setShowOptions(false);
              }}
              className={`
                w-full px-4 py-2 text-left hover:bg-blue-50
                transition-colors duration-200
                ${difficulty === level ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}
              `}
            >
              Level {level}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NumberSelector({ onSelect, selectedNumber, disabledNumbers }) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  return (
    <div className="flex flex-col ml-4 h-[calc(9*3rem)] border-2 border-gray-400 bg-gray-50">
      {numbers.map(number => {
        const numberStr = number.toString();
        const isDisabled = disabledNumbers.includes(numberStr);
        
        return (
          <button
            key={number}
            onClick={() => !isDisabled && onSelect(numberStr)}
            className={`
              w-12 h-[calc(100%/9)] text-xl font-semibold
              border-b border-gray-300 last:border-b-0
              transition-all duration-200
              ${selectedNumber === numberStr 
                ? 'bg-blue-500 text-white' 
                : isDisabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white hover:bg-blue-100'}
            `}
            disabled={isDisabled}
          >
            {number}
          </button>
        );
      })}
    </div>
  );
}

function Cell({ 
  value, 
  isInitial, 
  isSelected, 
  isRelated, 
  hasConflict,
  row, 
  col, 
  onSelect 
}) {
  const borderStyles = `
    ${col % 3 === 0 ? 'border-l-2' : 'border-l'} 
    ${row % 3 === 0 ? 'border-t-2' : 'border-t'}
    ${col === 8 ? 'border-r-2' : ''}
    ${row === 8 ? 'border-b-2' : ''}
  `;

  const getBgColor = () => {
    if (hasConflict) return 'bg-red-50';
    if (isSelected) return 'bg-blue-100';
    if (isRelated) return 'bg-blue-50';
    if (isInitial) return 'bg-gray-100';
    return value ? 'bg-white' : 'hover:bg-gray-50';
  };

  const getTextColor = () => {
    if (hasConflict) return 'text-red-600';
    if (isInitial) return 'text-gray-700';
    return 'text-blue-600';
  };

  return (
    <button 
      onClick={() => !isInitial && onSelect()}
      className={`
        w-12 h-12 text-center text-xl transition-colors
        border-gray-300 outline-none
        ${borderStyles}
        ${getBgColor()}
        ${getTextColor()}
        ${isInitial ? 'font-bold' : ''}
        focus:bg-blue-100 focus:border-blue-300
      `}
      disabled={isInitial}
    >
      {value}
    </button>
  );
}

// 将 getRelatedNumbers 移到组件外部作为独立函数
function getRelatedNumbers(grid, row, col) {
  const numbers = new Set();

  // 检查行
  for (let j = 0; j < 9; j++) {
    if (grid[row][j].value) numbers.add(grid[row][j].value);
  }

  // 检查列
  for (let i = 0; i < 9; i++) {
    if (grid[i][col].value) numbers.add(grid[i][col].value);
  }

  // 检查3x3方格
  const blockStartRow = Math.floor(row / 3) * 3;
  const blockStartCol = Math.floor(col / 3) * 3;
  for (let i = blockStartRow; i < blockStartRow + 3; i++) {
    for (let j = blockStartCol; j < blockStartCol + 3; j++) {
      if (grid[i][j].value) numbers.add(grid[i][j].value);
    }
  }

  return Array.from(numbers);
}

function Board({ grid, selectedCell, onCellSelect }) {
  const isRelatedCell = (row, col) => {
    if (!selectedCell) return false;
    
    if (row === selectedCell.row) return true;
    if (col === selectedCell.col) return true;
    
    const blockRow = Math.floor(row / 3) === Math.floor(selectedCell.row / 3);
    const blockCol = Math.floor(col / 3) === Math.floor(selectedCell.col / 3);
    if (blockRow && blockCol) return true;
    
    return false;
  };

  const hasConflict = (row, col) => {
    const value = grid[row][col].value;
    if (!value) return false;

    // 检查行
    for (let j = 0; j < 9; j++) {
      if (j !== col && grid[row][j].value === value) {
        return true;
      }
    }

    // 检查列
    for (let i = 0; i < 9; i++) {
      if (i !== row && grid[i][col].value === value) {
        return true;
      }
    }

    // 检查3x3方格
    const blockStartRow = Math.floor(row / 3) * 3;
    const blockStartCol = Math.floor(col / 3) * 3;
    for (let i = blockStartRow; i < blockStartRow + 3; i++) {
      for (let j = blockStartCol; j < blockStartCol + 3; j++) {
        if (i !== row && j !== col && grid[i][j].value === value) {
          return true;
        }
      }
    }

    return false;
  };

  return (
    <div className="grid grid-cols-9 border-2 border-gray-800">
      {grid.map((row, i) =>
        row.map((cell, j) => (
          <Cell
            key={`${i}-${j}`}
            value={cell.value}
            isInitial={cell.isInitial}
            isSelected={selectedCell && selectedCell.row === i && selectedCell.col === j}
            isRelated={selectedCell && isRelatedCell(i, j)}
            hasConflict={hasConflict(i, j)}
            onSelect={() => onCellSelect(i, j)}
            row={i}
            col={j}
          />
        ))
      )}
    </div>
  );
}

function VictoryModal({ onNewGame }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center transform transition-all">
        <h2 className="text-3xl font-bold text-green-600 mb-4">
          Congratulations! 🎉
        </h2>
        <p className="text-gray-600 mb-6">
          You've successfully completed the puzzle!
        </p>
        <button
          onClick={onNewGame}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded
            transition-colors duration-200"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

// LightBulb icon component
function LightBulbIcon({ className = "w-5 h-5" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
      />
    </svg>
  );
}

function HintButton({ onGetHint, disabled }) {
  return (
    <button
      onClick={onGetHint}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-2 rounded
        transition-all duration-200
        ${disabled 
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 hover:text-yellow-800'}
        border border-yellow-300
      `}
      title="Get a hint"
    >
      <LightBulbIcon />
      <span>Hint</span>
    </button>
  );
}

export default function SudokuGame() {
  const [grid, setGrid] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [difficulty, setDifficulty] = useState(5);
  const [showVictory, setShowVictory] = useState(false);
  const [solution, setSolution] = useState(null);

  // 根据难度计算要移除的格子数
  const calculateEmptyCells = (level) => {
    // 难度1时移除9个格子，难度10时移除最多65个格子
    return Math.floor(8 + (level - 1) * (65 - 9) / 9);
  };

  // 检查是否获胜
  const checkVictory = (grid) => {
    // 检查是否所有格子都已填写
    const isFilled = grid.every(row => 
      row.every(cell => cell.value !== '')
    );

    if (!isFilled) return false;

    // 检查是否有冲突
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (hasConflict(grid, i, j)) {
          return false;
        }
      }
    }

    return true;
  };

  // 检查单个格子是否有冲突
  const hasConflict = (grid, row, col) => {
    const value = grid[row][col].value;
    
    // 检查行
    for (let j = 0; j < 9; j++) {
      if (j !== col && grid[row][j].value === value) {
        return true;
      }
    }

    // 检查列
    for (let i = 0; i < 9; i++) {
      if (i !== row && grid[i][col].value === value) {
        return true;
      }
    }

    // 检查3x3方格
    const blockStartRow = Math.floor(row / 3) * 3;
    const blockStartCol = Math.floor(col / 3) * 3;
    for (let i = blockStartRow; i < blockStartRow + 3; i++) {
      for (let j = blockStartCol; j < blockStartCol + 3; j++) {
        if (i !== row && j !== col && grid[i][j].value === value) {
          return true;
        }
      }
    }

    return false;
  };

  // 获取数独解答
  const solveSudoku = (grid) => {
    const board = grid.map(row => 
      row.map(cell => cell.value ? parseInt(cell.value) : 0)
    );
    
    const isValid = (board, row, col, num) => {
      for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
      }
      for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
      }
      const startRow = row - row % 3, startCol = col - col % 3;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (board[i + startRow][j + startCol] === num) return false;
        }
      }
      return true;
    };

    const solve = (board) => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (board[row][col] === 0) {
            for (let num = 1; num <= 9; num++) {
              if (isValid(board, row, col, num)) {
                board[row][col] = num;
                if (solve(board)) return true;
                board[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    solve(board);
    return board;
  };

  // 获取提示
  const getHint = () => {
    if (!grid || !solution) return;

    // 找到第一个空白或错误的格子
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const cell = grid[i][j];
        if (!cell.isInitial) {
          const correctValue = solution[i][j].toString();
          if (cell.value !== correctValue) {
            // 高亮显示这个格子
            setSelectedCell({ row: i, col: j });
            // 更新格子并检查胜利
            const newGrid = grid.map((row, r) =>
              row.map((c, c_) =>
                r === i && c_ === j
                  ? { ...c, value: correctValue }
                  : c
              )
            );
            setGrid(newGrid);
            
            // 检查是否获胜
            if (checkVictory(newGrid)) {
              setShowVictory(true);
            }
            return;
          }
        }
      }
    }
  };

  // 初始化游戏
  useEffect(() => {
    const emptyCells = calculateEmptyCells(difficulty);
    const newGrid = generateSudoku(emptyCells / 81);
    setGrid(newGrid);
    // 生成解答
    setSolution(solveSudoku(newGrid));
  }, [difficulty]);

  const handleCellSelect = (row, col) => {
    if (grid && !grid[row][col].isInitial) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberSelect = (number) => {
    if (selectedCell && grid) {
      const newGrid = grid.map((r, i) =>
        r.map((cell, j) =>
          i === selectedCell.row && j === selectedCell.col
            ? { ...cell, value: number }
            : cell
        )
      );
      setGrid(newGrid);

      // 检查是否获胜
      if (checkVictory(newGrid)) {
        setShowVictory(true);
      }
    }
  };

  const handleNewGame = () => {
    const emptyCells = calculateEmptyCells(difficulty);
    const newGrid = generateSudoku(emptyCells / 81);
    setGrid(newGrid);
    setSolution(solveSudoku(newGrid));
    setSelectedCell(null);
    setShowVictory(false);
  };

  const getDisabledNumbers = () => {
    if (!selectedCell || !grid) return [];
    return getRelatedNumbers(grid, selectedCell.row, selectedCell.col);
  };

  if (!grid) {
    return (
      <div className="flex flex-col items-center p-8">
        <h1 className="text-3xl font-bold mb-8">Sudoku</h1>
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-8">Sudoku</h1>
      <div className="flex items-center gap-3 mb-6">
        <DifficultySelector 
          difficulty={difficulty} 
          onSelect={(level) => {
            setDifficulty(level);
            setSelectedCell(null);
            setShowVictory(false);
          }}
        />
        <button 
          onClick={handleNewGame}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold 
            py-2 px-4 rounded transition-colors duration-200"
        >
          New Game
        </button>
        <HintButton 
          onGetHint={getHint}
          disabled={showVictory || !grid}
        />
      </div>
      <div className="flex items-start">
        <div className="shadow-lg">
          <Board 
            grid={grid} 
            selectedCell={selectedCell}
            onCellSelect={handleCellSelect}
          />
        </div>
        <NumberSelector 
          onSelect={handleNumberSelect}
          selectedNumber={selectedCell ? grid[selectedCell.row][selectedCell.col].value : null}
          disabledNumbers={getDisabledNumbers()}
        />
      </div>
      {showVictory && (
        <>
          <Confetti />
          <VictoryModal onNewGame={handleNewGame} />
        </>
      )}
    </div>
  );
}
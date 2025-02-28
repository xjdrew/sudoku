function isValid(board, row, col, num) {
  // 检查行
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // 检查列
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // 检查3x3方格
  let startRow = row - row % 3;
  let startCol = col - col % 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
}

function solveSudoku(board) {
  let row = -1;
  let col = -1;
  let isEmpty = false;

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) {
        row = i;
        col = j;
        isEmpty = true;
        break;
      }
    }
    if (isEmpty) break;
  }

  if (!isEmpty) return true;

  for (let num = 1; num <= 9; num++) {
    if (isValid(board, row, col, num)) {
      board[row][col] = num;
      if (solveSudoku(board)) return true;
      board[row][col] = 0;
    }
  }
  return false;
}

export function generateSudoku(difficulty) {
  // 创建空板
  const board = Array(9).fill().map(() => Array(9).fill(0));
  
  // 填充对角线上的3个3x3方格
  for (let i = 0; i < 9; i += 3) {
    let nums = [1,2,3,4,5,6,7,8,9];
    for (let row = i; row < i + 3; row++) {
      for (let col = i; col < i + 3; col++) {
        const randomIndex = Math.floor(Math.random() * nums.length);
        board[row][col] = nums[randomIndex];
        nums.splice(randomIndex, 1);
      }
    }
  }

  // 解决剩余的数独
  solveSudoku(board);

  // 根据难度移除数字
  const cellsToRemove = Math.floor(81 * difficulty);
  const positions = Array.from({ length: 81 }, (_, i) => ({
    row: Math.floor(i / 9),
    col: i % 9
  }));
  
  // 随机打乱位置数组
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  // 移除指定数量的数字
  for (let i = 0; i < cellsToRemove; i++) {
    const { row, col } = positions[i];
    board[row][col] = 0;
  }

  // 转换为游戏格式
  return board.map(row => 
    row.map(cell => ({
      value: cell === 0 ? '' : cell.toString(),
      isInitial: cell !== 0
    }))
  );
} 
const PUZZLE = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}

function getPuzzle() {
  return cloneGrid(PUZZLE);
}

function isGivenCell(row, col) {
  return PUZZLE[row][col] !== 0;
}

function getPeers(row, col) {
  const peers = new Set();
  for (let index = 0; index < 9; index += 1) {
    peers.add(`${row},${index}`);
    peers.add(`${index},${col}`);
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r += 1) {
    for (let c = boxCol; c < boxCol + 3; c += 1) {
      peers.add(`${r},${c}`);
    }
  }

  peers.delete(`${row},${col}`);
  return [...peers].map((peer) => peer.split(",").map(Number));
}

function getAllowedValues(grid, row, col) {
  if (grid[row][col] !== 0) {
    return [];
  }

  const used = new Set(
    getPeers(row, col)
      .map(([peerRow, peerCol]) => grid[peerRow][peerCol])
      .filter((value) => value !== 0),
  );

  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((value) => !used.has(value));
}

function findConflicts(grid) {
  const conflicts = new Set();

  for (let row = 0; row < 9; row += 1) {
    for (let col = 0; col < 9; col += 1) {
      const value = grid[row][col];
      if (value === 0) {
        continue;
      }

      const hasDuplicate = getPeers(row, col).some(
        ([peerRow, peerCol]) => grid[peerRow][peerCol] === value,
      );
      if (hasDuplicate) {
        conflicts.add(`${row},${col}`);
      }
    }
  }

  return [...conflicts].map((cell) => cell.split(",").map(Number));
}

function isSolved(grid) {
  const hasEmptyCell = grid.some((row) => row.some((value) => value === 0));
  return !hasEmptyCell && findConflicts(grid).length === 0;
}

function createGame(root) {
  let grid = getPuzzle();
  let selectedCell = null;

  const board = root.querySelector("[data-board]");
  const status = root.querySelector("[data-status]");
  const hint = root.querySelector("[data-hint]");
  const resetButton = root.querySelector("[data-reset]");
  const checkButton = root.querySelector("[data-check]");

  function updateStatus(message) {
    status.textContent = message;
  }

  function updateHint() {
    if (!selectedCell) {
      hint.textContent = "选择一个空格，查看可填数字。";
      return;
    }

    const [row, col] = selectedCell;
    if (isGivenCell(row, col)) {
      hint.textContent = "这是题目给出的数字，不能修改。";
      return;
    }

    const values = getAllowedValues(grid, row, col);
    hint.textContent = values.length
      ? `第 ${row + 1} 行第 ${col + 1} 列可填：${values.join("、")}`
      : "这里暂时没有合法数字，请检查周围冲突。";
  }

  function updateSelectionStyles() {
    board.querySelectorAll(".cell").forEach((cell) => {
      const isSelected =
        selectedCell &&
        Number(cell.dataset.row) === selectedCell[0] &&
        Number(cell.dataset.col) === selectedCell[1];
      cell.classList.toggle("selected", Boolean(isSelected));
    });
  }

  function render() {
    board.innerHTML = "";
    const conflictKeys = new Set(findConflicts(grid).map(([row, col]) => `${row},${col}`));

    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        const cell = document.createElement("input");
        cell.className = "cell";
        cell.inputMode = "numeric";
        cell.maxLength = 1;
        cell.pattern = "[1-9]";
        cell.autocomplete = "off";
        cell.ariaLabel = `第 ${row + 1} 行第 ${col + 1} 列`;
        cell.value = grid[row][col] || "";
        cell.dataset.row = String(row);
        cell.dataset.col = String(col);

        if (isGivenCell(row, col)) {
          cell.readOnly = true;
          cell.classList.add("given");
        }

        if (conflictKeys.has(`${row},${col}`)) {
          cell.classList.add("conflict");
        }

        if (selectedCell && selectedCell[0] === row && selectedCell[1] === col) {
          cell.classList.add("selected");
        }

        cell.addEventListener("focus", () => {
          selectedCell = [row, col];
          updateSelectionStyles();
          updateHint();
        });

        cell.addEventListener("input", (event) => {
          const nextValue = event.target.value.replace(/[^1-9]/g, "").slice(-1);
          grid[row][col] = nextValue ? Number(nextValue) : 0;
          render();
          const nextCell = board.querySelector(`[data-row="${row}"][data-col="${col}"]`);
          if (nextCell) {
            nextCell.focus();
          }
          updateHint();
          updateStatus(findConflicts(grid).length ? "有重复数字，请检查红色格子。" : "继续加油！");
        });

        board.append(cell);
      }
    }
  }

  resetButton.addEventListener("click", () => {
    grid = getPuzzle();
    selectedCell = null;
    render();
    updateHint();
    updateStatus("棋盘已重置。");
  });

  checkButton.addEventListener("click", () => {
    if (isSolved(grid)) {
      updateStatus("恭喜，数独完成！");
      return;
    }

    updateStatus(findConflicts(grid).length ? "还存在冲突。" : "没有冲突，但还有空格未填写。");
  });

  render();
  updateHint();
  updateStatus("填写 1-9，重复数字会自动标红。");
}

if (typeof document !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    createGame(document);
  });
}

if (typeof module !== "undefined") {
  module.exports = {
    getPuzzle,
    isGivenCell,
    getAllowedValues,
    findConflicts,
    isSolved,
  };
}

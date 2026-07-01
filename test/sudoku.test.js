const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getPuzzle,
  isGivenCell,
  getAllowedValues,
  findConflicts,
  isSolved,
} = require("../app.js");

test("getPuzzle returns a 9 by 9 sudoku puzzle with fixed givens", () => {
  const puzzle = getPuzzle();

  assert.equal(puzzle.length, 9);
  assert.ok(puzzle.every((row) => row.length === 9));
  assert.equal(puzzle[0][0], 5);
  assert.equal(puzzle[0][2], 0);
  assert.equal(isGivenCell(0, 0), true);
  assert.equal(isGivenCell(0, 2), false);
});

test("getAllowedValues excludes numbers already used in row, column, and box", () => {
  const puzzle = getPuzzle();

  assert.deepEqual(getAllowedValues(puzzle, 0, 2), [1, 2, 4]);
});

test("findConflicts reports duplicate editable values in peers", () => {
  const puzzle = getPuzzle();
  puzzle[0][2] = 3;
  puzzle[1][1] = 3;

  const conflicts = findConflicts(puzzle).map(([row, col]) => `${row},${col}`);

  assert.ok(conflicts.includes("0,1"));
  assert.ok(conflicts.includes("0,2"));
  assert.ok(conflicts.includes("1,1"));
});

test("isSolved accepts the known solution and rejects incomplete grids", () => {
  const solution = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];
  const incomplete = getPuzzle();

  assert.equal(isSolved(solution), true);
  assert.equal(isSolved(incomplete), false);
});

export class Game {
  grid = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  constructor() {}

  plot(x, y, value) {
    this.grid[x][y] = value;
  }

  data() {
    return JSON.stringify(this.grid);
  }
}

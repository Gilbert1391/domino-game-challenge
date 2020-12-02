class Tile {
  _tiles = [];
  _min = 0;
  _max = 6;
  constructor() {
    this._fetchTiles(this._max);
  }

  getTiles() {
    return this._tiles;
  }

  getTilesTotal() {
    return this._tiles.length;
  }

  _fetchTiles(n) {
    if (n === this._min) {
      this._tiles.push([n, this._min]);
      return 0;
    }
    let small = n;
    while (small >= this._min) {
      this._tiles.push([n, small]);
      small -= 1;
    }
    this._fetchTiles(n - 1);
  }
}

class Domino {
  static boardTiles = [];
  tiles;
  players = [];
  _playerMaxNumOfTiles = 7;
  _doubleSix = '[6,6]';
  _nextPlayer;
  constructor(tiles, players) {
    this.tiles = tiles;
    this.players = players;
  }

  // Randomize array in-place using Durstenfeld shuffle algorithm
  shuffleTiles() {
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tiles[i], this.tiles[j]] = [this.tiles[j], this.tiles[i]];
    }
  }

  dealTilesToPlayers() {
    for (let i = 0; i < this.players.length; i++) {
      for (let j = 0; j < this._playerMaxNumOfTiles; j++) {
        let tile = this.tiles.pop();
        this.players[i].tiles.add(JSON.stringify(tile));
      }
    }
  }

  printPlayersTiles() {
    let tiles = [];
    for (let i = 0; i < this.players.length; i++) {
      this.players[i].tiles.forEach((e) => tiles.push(e));
      console.log({ name: this.players[i].name, tiles });
      tiles = [];
    }
  }

  addToBoard(tile) {
    tile = JSON.parse(tile);
    Domino.boardTiles.push({
      key: JSON.stringify(tile),
      firstVal: tile[0],
      secondVal: tile[1],
    });
  }

  getBoardTiles() {
    return Domino.boardTiles;
  }

  getBoardState() {
    return Domino.boardTiles.map((e) => e.key);
  }

  _getStartingPlayer() {
    const players = this.players;
    for (var i = 0; i < players.length; i++) {
      if (players[i].tiles.has(this._doubleSix)) {
        return players[i];
      }
    }
  }

  _getNextPlayer(prevPlayer) {
    const index = this.players.indexOf(prevPlayer);
    const next = index === this.players.length - 1 ? 0 : index + 1;
    return this.players[next];
  }

  _printGameState(currPlayer, nextPlayer) {
    console.log('---CURRENT TURN---');
    console.log('CURRENT PLAYER: ' + currPlayer.name);
    console.log('CURRENT PLAYER PLAYABLE TILES: ', currPlayer.tiles);
    console.log('BOARD: ', this.getBoardState());
    console.log('PLAYABLE TILES: ', currPlayer.getPlayableTiles());
    console.log('NEXT PLAYER: ', nextPlayer.name);
  }

  init() {
    const startingPlayer = this._getStartingPlayer();
    const nextPlayer = this._getNextPlayer(startingPlayer);
    this._nextPlayer = nextPlayer;
    this._printGameState(startingPlayer, nextPlayer);
    startingPlayer.executeTurn(this._doubleSix);
  }

  playGame() {
    // get current player
    // check if the player has a tile that can be played
    //  if true, check if this player has multiple tiles to play,
    //          if true play a tile randomly, else play the only tile available, for both cases add tile to board
    //   go to next player and call this method recursively
    // else go to next player and call this method recursively
    // repeat until a player has no tiles and return the winner
    let winner;
    this.players.forEach((player) => {
      if (player.tiles.size === 0) {
        winner = player;
      }
    });

    if (winner) {
      console.log('WINNER: ' + winner.name);
      return;
    } else {
      const currentPlayer = this._nextPlayer;
      this._printGameState(currentPlayer, this._getNextPlayer(currentPlayer));

      if (currentPlayer.isAbleToPlay()) {
        if (currentPlayer.hasMultipleTilesToPlay()) {
          const tiles = currentPlayer.getPlayableTiles();
          const tile = tiles[Math.floor(Math.random() * tiles.length)];
          currentPlayer.executeTurn(tile);
        } else {
          const tile = currentPlayer.getPlayableTiles()[0];
          currentPlayer.executeTurn(tile);
        }
        this._nextPlayer = this._getNextPlayer(currentPlayer);
      } else {
        this._nextPlayer = this._getNextPlayer(currentPlayer);
      }
      this.playGame();
    }
  }
}

class Player extends Domino {
  tiles = new Set();
  name;
  constructor(name) {
    super();
    this.name = name;
  }

  executeTurn(tile) {
    this.addToBoard(tile);
    this.tiles.delete(tile);
  }

  getPlayableTiles() {
    const result = [];
    const boardTiles = this.getBoardTiles();
    if (boardTiles.length === 0) {
      return [this._doubleSix];
    } else {
      this.tiles.forEach((tile) => {
        for (let i = 0; i < boardTiles.length; i++) {
          const firstVal = JSON.stringify(boardTiles[i].firstVal);
          const secondVal = JSON.stringify(boardTiles[i].secondVal);
          if ((tile.includes(firstVal) || tile.includes(secondVal)) && !result.includes(tile)) {
            result.push(tile);
          }
        }
      });
      return result;
    }
  }

  isAbleToPlay() {
    return !!this.getBoardTiles().length;
  }

  hasMultipleTilesToPlay() {
    return this.getPlayableTiles().length > 1;
  }
}

const playerA = new Player('playerA');
const playerB = new Player('playerB');
const playerC = new Player('playerC');
const playerD = new Player('playerD');
const tile = new Tile();

const tiles = tile.getTiles();
const players = [playerA, playerB, playerC, playerD];

const domino = new Domino(tiles, players);

// Init state
domino.shuffleTiles();
domino.dealTilesToPlayers();
domino.printPlayersTiles();

// Start
domino.init();
domino.playGame();

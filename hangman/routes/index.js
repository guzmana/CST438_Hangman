var express = require('express');
var fs = require("fs");
var router = express.Router();

/** Get a random word from the list of words*/
function randomWord() {
  var words = fs.readFileSync("./hangmanwords.txt", "utf-8");
  var wordArray = words.split("\n")
  return wordArray[Math.floor(Math.random() * wordArray.length)].trim();
}

/** Enum of GameState's */
var GameState = {
  PLAYING: 1,
  WON: 2,
  LOST: 3,
};

/** Class that contains game state */
class Game {
  constructor() {
    this.word = randomWord().toLowerCase();
    this.attempts = 1;
    this.maxAttempts = 8;
    this.mask = Array(this.word.length).fill(false);
    this.state = GameState.PLAYING;
    this.message = 'Input letter to start playing';
    this.played = [];
    console.log(this.word);
  }

  /** Return true if game has been won and false otherwise */
  isWon() {
    for (var maskBool of this.mask) {
      if(maskBool == false) {
        return false;
      }
    }
    return true;
  }

  /** Return true if game has been lost and false otherwise */
  isLost() {
    return this.attempts > this.maxAttempts;
  }

  /**
   * Update the mask used to print the discovered word
  * @param {string} letter
  */
  updateMask(letter) {
    for (var i = 0; i < this.mask.length; i++) {
      if(this.word.charAt(i) == letter) {
        this.mask[i] = true;
      }
    }
  }

  /** Generate the masked word using the mask */
  generateMaskedWord() {
    var s = '';
    for (var i = 0; i < this.mask.length; i++) {
      if (this.mask[i]) {
        s = s + this.word.charAt(i);
      } else {
        s = s + "#";
      }
    }
    return s;
  }

  /**
   * Contains all the logic for playing a letter.
  * @param {string} letter
  */
  play(letter) {
    if(this.state == GameState.PLAYING) {
      if(this.isValid(letter)) {
        letter = letter.toLowerCase();
        if(this.word.includes(letter)) {
          this.updateMask(letter);
          this.played.push(letter);
          if(this.isWon()) {
            this.state = GameState.WON;
            this.message = "Congratulation you have won!"
          } else if(this.isLost()){
            this.state = GameState.LOST;
            this.message = "WHAT A LOSER!! The word was: " + this.word;
          } else {
            this.message = 'Correct! Input next letter';
          }
        } else {
          this.attempts++;
          this.played.push(letter);
          if(this.isLost()){
            this.state = GameState.LOST;
            this.message = "WHAT A LOSER!! The word was: " + this.word;
            this.attempts--;
          } else {
            this.message = 'Incorrect! Input next letter';
          }
        }
      } else {
        this.message = "Please input a single alphabet character that hasn't been used before";
      }
    } else {
      this.message = "Game is done. Please click retry to play again.";
    }
  }

  /**
   * Determine if input is valid.
  * @param {string} input
  */
  isValid(input) {
    if(input.length != 1) { 
      return false;
    } else if(/^[a-zA-Z()]+$/.test(input) == false) { 
      return false;
    } else if(this.played.includes(input)) {
      return false;
    } else {
      return true;
    }
  }
}

var game = new Game();

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index', { title: 'Hangman', 
                        mask: game.generateMaskedWord(), 
                        status: game.message,
                        attempted: game.attempts,
                        max: game.maxAttempts
                      });
});

/* POST home page. */
router.post('/play', function(req, res, next) {
  if(req.body.retry) {
    game = new Game();
  } else {
    game.play(req.body.letter);
  }
  res.redirect('/');
});

module.exports = router;

var express = require('express');
var fs = require("fs");
var router = express.Router();

function randomWord() {

  var words = fs.readFileSync("./hangmanwords.txt", "utf-8");
  var wordArray = words.split("\n")
  return wordArray[Math.floor(Math.random() * wordArray.length)].trim();
}

var GameState = {
  PLAYING: 1,
  WON: 2,
  LOST: 3,
};

class Game {
  constructor() {
    this.word = randomWord();
    this.attempts = 1;
    this.maxAttempts = 8;
    this.mask = Array(this.word.length).fill(false);
    this.state = GameState.PLAYING;
    this.message = 'Input letter to start playing';
    this.played = [];
    console.log(this.word);
  }

  isWon() {
    for (var maskBool of this.mask) {
      if(maskBool == false) {
        return false;
      }
    }
    return true;
  }

  isLost() {
    return this.attempts > this.maxAttempts;
  }

  /**
  * @param {string} letter
  */
  updateMask(letter) {
    for (var i = 0; i < this.mask.length; i++) {
      if(this.word.charAt(i) == letter) {
        this.mask[i] = true;
      }
    }
  }

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
  * @param {string} letter
  */
  play(letter) {
    if(this.state == GameState.PLAYING) {
      if(this.isValid(letter)) {
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
    console.log("RETRY");
    game = new Game();
  } else {
    console.log("SUBMIT");
    game.play(req.body.letter);
  }
  res.redirect('/');
});

module.exports = router;

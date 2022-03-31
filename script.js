// Global constants
const clueHoldTime = 1000; // how long to hold each clue's light & sound
const cluePauseTime = 333; // how long to pause in between clues
const nextClueWaitTime = 1000; // how long to wait before starting playback of the clue sequence

// Global variables
var pattern = [2, 2, 4, 3, 2, 1, 2, 4]; // secret pattern of button presses
var progress = 0; // how far along player is in guessing the pattern (index of pattern array)
var gamePlaying = false;

var tonePlaying = false;
var volume = 0.5; // must be between 0.0 and 1.0

var guessCounter = 0; // resets to 0 every new turn (next clue sequence)

function startGame() {
  // initialize game variables
  progress = 0;
  gamePlaying = true;

  // swap the Start and Stop buttons
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");

  // start the game!
  playClueSequence();
}

function stopGame() {
  gamePlaying = false;
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
}

// Sound Synthesis Functions
const freqMap = {
  1: 261.6,
  2: 329.6,
  3: 392,
  4: 466.2,
};

// Plays tone for a specified amount of time
function playTone(btn, len) {
  // takes in button number and length of time
  o.frequency.value = freqMap[btn];
  g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
  context.resume();
  tonePlaying = true;
  setTimeout(function () {
    stopTone();
  }, len);
}

// Once called, tones will continue to play until stopTone() is called
function startTone(btn) {
  if (!tonePlaying) {
    context.resume();
    o.frequency.value = freqMap[btn];
    g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
    context.resume();
    tonePlaying = true;
  }
}

function stopTone() {
  g.gain.setTargetAtTime(0, context.currentTime + 0.05, 0.025);
  tonePlaying = false;
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var o = context.createOscillator();
var g = context.createGain();
g.connect(context.destination);
g.gain.setValueAtTime(0, context.currentTime);
o.connect(g);
o.start(0);

function lightButton(btn) {
  document.getElementById("button" + btn).classList.add("lit");
}

function clearButton(btn) {
  document.getElementById("button" + btn).classList.remove("lit");
}

function playSingleClue(btn) {
  if (gamePlaying) {
    lightButton(btn);
    playTone(btn, clueHoldTime);
    setTimeout(clearButton, clueHoldTime, btn); // built-in JavaScript function that calls first parameter function in the future (designated in clueHoldTime)
  }
}

function playClueSequence() {
  // context.resume()
  guessCounter = 0;
  let delay = nextClueWaitTime; // running total of how long in the future to play the next clue
  for (let i = 0; i <= progress; i++) {
    // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms"); // pattern array is storing secret pattern of clues
    setTimeout(playSingleClue, delay, pattern[i]); // set a timeout to play that clue
    delay += clueHoldTime;
    delay += cluePauseTime;
  }
}

function guess(btn) {
  console.log("user guessed: " + btn);

  if (!gamePlaying) {
    // is the game active? (pressed start)
    return;
  }

  if (btn != pattern[guessCounter]) {
    loseGame();
  } else {
    // Correct guess! Moving on:
    if (guessCounter != progress) {
      // Turn is not over yet, check the next guess
      guessCounter++;
    } else {
      if (progress == pattern.length - 1) {
        winGame();
      } else {
        // This is the last turn! Play the next pattern
        progress++;
        playClueSequence();
      }
    }
  }
}

// Win/Loss notifications
function loseGame() {
  stopGame();
  alert("Game Over. You lost."); // built-in JavaScript function with pop up dialog box
}

function winGame() {
  stopGame();
  alert("Congratulations, you won!");
}

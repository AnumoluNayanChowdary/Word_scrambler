import React, { useState, useEffect, useCallback } from 'react';
import './WordScrambleGame.css';

const WordScrambleGame = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('______');
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0
  );
  const [hintUsed, setHintUsed] = useState(false);

  const shuffleWord = (word) => {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  };

  const fetchNewWord = async () => {
    const response = await fetch('https://random-word-api.herokuapp.com/word?number=1');
    const data = await response.json();
    return data[0];
  };

  const newScramble = useCallback(async () => {
    setMessage('Loading...');
    setGuess('');
    setScrambledWord('______');
    setHintUsed(false);

    let validWord = '';

    while (!validWord || validWord.length < 4) {
      try {
        const word = await fetchNewWord();
        validWord = word.toLowerCase();
      } catch (e) {
        setMessage("⚠️ Couldn't load word. Retrying...");
      }
    }

    let scrambled = shuffleWord(validWord);
    while (scrambled === validWord) {
      scrambled = shuffleWord(validWord);
    }

    setCurrentWord(validWord);
    setScrambledWord(scrambled);
    setMessage('');
  }, []);

  const showHint = () => {
    if (hintUsed) {
      setMessage('Hint already used!');
      return;
    }
    setMessage(`Hint: The first letter is "${currentWord[0].toUpperCase()}"`);
    setHintUsed(true);
  };

  const updateScores = (newScore) => {
    setScore(newScore);
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem('highScore', newScore);
    }
  };

  const checkGuess = () => {
    const trimmed = guess.trim().toLowerCase();
    if (!trimmed) {
      setMessage('Please enter a guess!');
      return;
    }

    if (trimmed === currentWord) {
      setMessage('🎉 Correct!');
      updateScores(score + 1);
    } else {
      setMessage(`❌ Wrong! The correct word was "${currentWord}". Score reset.`);
      updateScores(0);
    }

    setTimeout(() => {
      newScramble();
    }, 1000);
  };

  useEffect(() => {
    newScramble();
  }, [newScramble]);

  return (
    <div className="scramble-container">
      <h1>Word Scramble Game</h1>

      <div id="scrambled">{scrambledWord}</div>

      <input
        type="text"
        id="guess"
        placeholder="Type your guess here"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === 'Enter') checkGuess();
        }}
        autoComplete="off"
      />

      <div id="buttons-container">
        <button id="submit-btn" onClick={checkGuess}>Submit</button>
        <button id="hint-btn" onClick={showHint}>Hint</button>
      </div>

      <div id="message">{message}</div>
      <div id="score">Score: {score} <br /> High Score: {highScore}</div>
    </div>
  );
};

export default WordScrambleGame;
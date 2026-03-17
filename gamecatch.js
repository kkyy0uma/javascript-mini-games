const telaInicio = document.querySelector('.container-start');
const telaTutorial = document.querySelector('.container-tutorial');
const telaGame = document.querySelector('.container-game');
const leaderboard = document.querySelector('.leaderboard');
const btnTutorial = document.querySelector('.btn-tutorial');
const btnStart = document.querySelector('.btn-start');
const btnRestart = document.querySelector('.btn-restart');
const btnMenu = document.querySelector('.return-menu');

const scoreEl = document.querySelector('.score');
const healthDisplay = document.querySelector('.health-display');
const boostDisplay = document.querySelector('.boost-display');
const result = document.querySelector('.result');
const result2 = document.querySelector('.result2');

const player = document.querySelector('.player');

const easy = document.querySelector('.btn-diff.easy');
const medium = document.querySelector('.btn-diff.medium');
const hard = document.querySelector('.btn-diff.hard');
const exibeDiff = document.querySelector('.diff-display');
const gameDisplayDiff = document.querySelector('.difficulty');

const maxBoost = 2;

const speedMultiplier = {
  easy: 0.9,
  medium: 1,
  hard: 1.2,
};

const spawnMultiplier = {
  easy: 1.5,
  medium: 1,
  hard: 0.7,
};

let gamediff = '';
let gamestate = 'menu';

let score = 0;
let lastMilestone = 0;
let boostCounter = 0;

let spawnInterval;
let fruits = [];
let fruitType;

let healthbar = 3;
let boostActive = false;

// LISTENERS
btnTutorial.addEventListener('click', () => {
  if (gamediff === '') {
    exibeDiff.innerText = 'Escolha a Dificuldade!';
    exibeDiff.style.visibility = 'visible';
    exibeDiff.style.color = 'black';
    return;
  }

  Tutorial();
});

btnStart.addEventListener('click', () => {
  if (gamestate !== 'tutorial') return;
  IniciarJogo();
});

btnRestart.addEventListener('click', IniciarJogo);
document.addEventListener('keydown', (e) => {
  if (e.key === 'r' && gamestate === 'gameover') {
    IniciarJogo();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'b' && boostCounter === maxBoost) {
    boostActive = true;
    boostCounter = 0;

    boostDisplay.classList.remove('boost-alert');
    boostDisplay.classList.add('boost-after-activate');

    setTimeout(() => {
      boostActive = false;
      boostDisplay.classList.remove('boost-after-activate');
    }, 3000);

    BoostActivation();
  }
});

// FUNÇÃO MOVER
let movingLeft = false;
let movingRight = false;
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && gamestate === 'playing') {
    movingLeft = true;
  }
  if (e.key === 'ArrowRight' && gamestate === 'playing') {
    movingRight = true;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' && gamestate === 'playing') {
    movingLeft = false;
  }
  if (e.key === 'ArrowRight' && gamestate === 'playing') {
    movingRight = false;
  }
});

// DIFICULDADES
easy.addEventListener('click', () => {
  DefinirDificuldade('easy');
  localStorage.setItem('catchDifficulty', 'easy');
});

medium.addEventListener('click', () => {
  DefinirDificuldade('medium');
  localStorage.setItem('catchDifficulty', 'medium');
});

hard.addEventListener('click', () => {
  DefinirDificuldade('hard');
  localStorage.setItem('catchDifficulty', 'hard');
});

function DefinirDificuldade(diff) {
  gamediff = diff;

  easy.classList.remove('btn-selected');
  medium.classList.remove('btn-selected');
  hard.classList.remove('btn-selected');

  if (diff === 'easy') {
    easy.classList.add('btn-selected');
    exibeDiff.style.color = 'green';
    exibeDiff.innerText = 'Modo Fácil';
    gameDisplayDiff.innerText = '_Fácil';
    gameDisplayDiff.style.color = 'lightgreen';
  }

  if (diff === 'medium') {
    medium.classList.add('btn-selected');
    exibeDiff.style.color = 'yellow';
    exibeDiff.innerText = 'Modo Médio';
    gameDisplayDiff.innerText = '_Médio';
    gameDisplayDiff.style.color = 'orange';
  }

  if (diff === 'hard') {
    hard.classList.add('btn-selected');
    exibeDiff.style.color = 'red';
    exibeDiff.innerText = 'Modo Difícil';
    gameDisplayDiff.innerText = '_Difícil';
    gameDisplayDiff.style.color = 'red';
  }

  exibeDiff.style.visibility = 'visible';
}

function Tutorial() {
  gamestate = 'tutorial';

  telaInicio.style.display = 'none';
  telaGame.style.display = 'none';
  leaderboard.style.display = 'none';
  telaTutorial.style.display = 'block';
}

const GameLoop = () => {
  if (gamestate !== 'playing') return;

  const currentLeft = parseInt(player.style.left) || 370;

  const playerSpeed = boostActive ? 16 : 8;

  if (movingLeft && currentLeft > 0) {
    player.style.left = currentLeft - playerSpeed + 'px';
  }
  if (movingRight && currentLeft < 810) {
    player.style.left = currentLeft + playerSpeed + 'px';
  }

  scoreEl.textContent = score;

  FruitsLoop();
  requestAnimationFrame(GameLoop);
};

function UpdateHealth() {
  if (gamestate !== 'playing') return;
  console.log(healthbar);
  healthDisplay.classList.remove('health-1', 'health-2', 'health-3', 'health-warning');

  if (healthbar <= 0) {
    GameOver();
    return;
  }

  healthDisplay.classList.add(`health-${healthbar}`);

  healthDisplay.classList.add('health-warning');
  setTimeout(() => {
    healthDisplay.classList.remove('health-warning');
  }, 800);
}

function IniciarJogo() {
  gamestate = 'playing';
  healthbar = 3;
  score = 0;
  lastMilestone = 0;
  boostCounter = 0;
  boostActive = false;

  telaTutorial.style.display = 'none';
  telaGame.style.display = 'block';
  btnRestart.style.visibility = 'hidden';
  btnMenu.style.visibility = 'hidden';

  healthDisplay.style.visibility = 'visible';
  gameDisplayDiff.style.visibility = 'visible';
  scoreEl.style.visibility = 'visible';

  boostDisplay.classList.remove('boost-alert', 'boost-after-activate');
  boostDisplay.style.visibility = 'hidden';
  result.style.visibility = 'hidden';
  result2.style.visibility = 'hidden';

  const spawnDiff = spawnMultiplier[gamediff];

  spawnInterval = setInterval(SpawnObstacle, 1500 * spawnDiff);
  GameLoop();
  UpdateHealth();
  BoostActivation();
}

function SpawnObstacle() {
  if (gamestate !== 'playing') return;

  const gameWidth = telaGame.clientWidth;
  const fruit = document.createElement('div');

  const randFruit = Math.random();

  if (randFruit < 0.8) {
    fruitType = Math.floor(Math.random() * 4) + 1;
  } else if (randFruit < 0.85 && healthbar <= 2) {
    fruitType = 6;
  } else {
    if (boostCounter !== maxBoost) {
      fruitType = 5;
    } else {
      fruitType = Math.floor(Math.random() * 4) + 1;
    }
  }

  fruit.classList.add('fruit' + fruitType);

  if (fruitType === 6) fruit.classList.add('fruit-heart');

  if (fruitType === 5) fruit.classList.add('fruit-boost');

  fruit.style.position = 'absolute';
  fruit.style.left = Math.random() * (gameWidth - 32) + 'px';
  fruit.style.top = '0px';

  telaGame.appendChild(fruit);

  fruits.push({
    element: fruit,
    type: fruitType,
    y: 0,
    baseSpeed: 4,
    scoreGiven: false,
  });
}

function FruitsLoop() {
  if (gamestate !== 'playing') return;

  const speedDiff = speedMultiplier[gamediff];

  if (score % 10 === 0 && score !== lastMilestone) {
    lastMilestone = score;
    ScoreEffect();
  }

  fruits.forEach((fruit) => {
    if (fruit.type === 6) fruit.y += 2;
    else {
      fruit.y += fruit.baseSpeed * speedDiff;
    }

    fruit.element.style.top = fruit.y + 'px';

    const diffX = fruit.element.offsetLeft - player.offsetLeft;

    if (!fruit.attached && fruit.y > 467 && fruit.y < 472 && diffX > -5 && diffX < 70) {
      if (fruit.type === 6) {
        if (fruit.healed) return;
        fruit.healed = true;

        fruit.element.classList.add('fruit-heart-attached');
        fruit.baseSpeed = 0;

        if (healthbar <= 2) {
          const fruitRect = fruit.element.getBoundingClientRect();
          const gameRect = telaGame.getBoundingClientRect();
          const x = fruitRect.left - gameRect.left;
          const y = fruitRect.top - gameRect.top;

          healthbar++;
          SpawnFloatingHealth(x, y);
          UpdateHealth();
        }

        setTimeout(() => {
          fruit.element.remove();
          fruit.delete = true;
        }, 400);

        return;
      }

      fruit.attached = true;
      fruit.baseSpeed = 0;
      fruit.offsetX = diffX;

      let points = 1;

      if (fruit.type === 5) {
        points = 5;
      }

      fruit.points = points;
      score += points;

      if (fruit.type === 5 && boostCounter < maxBoost) {
        boostCounter++;
        fruit.element.classList.remove('fruit-boost');
        fruit.element.classList.add('fruit-boost-pop');
        BoostActivation();
      }
    }

    if (fruit.attached) {
      fruit.element.style.left = player.offsetLeft + fruit.offsetX + 'px';

      if (!fruit.scoreGiven) {
        fruit.scoreGiven = true;

        const fruitRect = fruit.element.getBoundingClientRect();
        const gameRect = telaGame.getBoundingClientRect();

        const x = fruitRect.left - gameRect.left;
        const y = fruitRect.top - gameRect.top;

        SpawnFloatingScore(x, y, fruit.points);
        if (fruit.type === 5) SpawnFloatingBoost(x, y, fruit.type);
      }

      if (!fruit.removing) {
        fruit.removing = true;

        setTimeout(() => {
          fruit.element.classList.add('remove-fade');

          setTimeout(() => {
            fruit.element.remove();
            fruit.delete = true;
          }, 500);
        }, 5000);
      }
    }

    if (fruit.y > telaGame.clientHeight) {
      fruit.element.remove();
      fruit.delete = true;

      if (fruit.type !== 6) {
        healthbar--;
        UpdateHealth();
      }
    }
  });

  fruits = fruits.filter((fruit) => !fruit.delete);
}

function BoostActivation() {
  if (boostCounter === maxBoost) {
    boostDisplay.style.visibility = 'visible';
    boostDisplay.classList.add('boost-alert');
  } else {
    boostDisplay.style.visibility = 'hidden';
    boostDisplay.classList.remove('boost-alert');
  }
}

function ScoreEffect() {
  scoreEl.classList.add('score-effect');

  setTimeout(() => {
    scoreEl.classList.remove('score-effect');
  }, 400);
}

function SpawnFloatingScore(x, y, value) {
  const text = document.createElement('div');
  text.classList.add('floating-score');

  text.innerText = '+' + value;

  text.style.left = x + 'px';
  text.style.top = y + 'px';

  telaGame.appendChild(text);

  setTimeout(() => {
    text.remove();
  }, 1000);
}

function SpawnFloatingBoost(x, y) {
  const boostText = document.createElement('div');
  boostText.classList.add('floating-boost');

  boostText.innerText = '+BOOST';

  boostText.style.left = x + 'px';
  boostText.style.top = y - 30 + 'px';

  telaGame.appendChild(boostText);

  setTimeout(() => {
    boostText.remove();
  }, 1000);
}

function SpawnFloatingHealth(x, y) {
  const healthText = document.createElement('div');
  healthText.classList.add('floating-health');

  healthText.innerText = '+VIDA';

  healthText.style.left = x + 'px';
  healthText.style.top = y - 20 + 'px';

  telaGame.appendChild(healthText);

  setTimeout(() => {
    healthText.remove();
  }, 1000);
}

function GameOver() {
  gamestate = 'gameover';

  clearInterval(spawnInterval);

  healthDisplay.style.visibility = 'hidden';
  boostDisplay.style.visibility = 'hidden';

  result.style.visibility = 'visible';
  result2.style.visibility = 'visible';
  result.innerHTML = 'Você perdeu!';
  result2.innerHTML = `Pontuação: ${score}`;

  btnRestart.style.visibility = 'visible';
  btnMenu.style.visibility = 'visible';

  fruits.forEach((fruit) => {
    fruit.element.remove();
  });

  fruits = [];

  const nick = prompt('Digite seu nick:') || 'Player';

  const diffNames = {
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil',
  };

  const nivel = diffNames[gamediff] || gamediff;

  if (nick) {
    saveScore(nick, score, nivel);
  }

  renderLeaderboard();
}

function saveScore(nick, score, nivel) {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

  leaderboard.push({ nick, score, nivel });

  leaderboard.sort((a, b) => b.score - a.score);

  leaderboard.splice(10);

  localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function renderLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

  const list = document.querySelector('.leaderboard-list');

  list.innerHTML = '';

  leaderboard.forEach((player, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${player.nick} — ${player.score} pts (${player.nivel})`;

    list.appendChild(li);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  const savedDiff = localStorage.getItem('catchDifficulty');

  renderLeaderboard();

  if (savedDiff) {
    DefinirDificuldade(savedDiff);
  }
});

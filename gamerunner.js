const telaInicio = document.querySelector('.container-start');
const telaTutorial = document.querySelector('.container-tutorial');
const telaGame = document.querySelector('.container-game');
const btnTutorial = document.querySelector('.btn-tutorial');
const btnStart = document.querySelector('.btn-start');
const btnRestart = document.querySelector('.btn-restart');
const btnMenu = document.querySelector('.return-menu');

const scoreEl = document.querySelector('.score');
const result = document.querySelector('.result');

const player = document.querySelector('.player');
const explosion = document.querySelector('.explosion');
const background = document.querySelector('.bg');

const easy = document.querySelector('.btn-diff.easy');
const medium = document.querySelector('.btn-diff.medium');
const hard = document.querySelector('.btn-diff.hard');
const exibeDiff = document.querySelector('.diff-display');
const gameDisplayDiff = document.querySelector('.difficulty');

const difficultyMultiplier = {
  easy: 0.5,
  medium: 1,
  hard: 1.5,
};

const spawnMultiplier = {
  easy: { min: 1800, max: 2300 },
  medium: { min: 1500, max: 2000 },
  hard: { min: 800, max: 1300 },
};

let gamediff = '';
let gamestate = 'menu';
let score = 0;
let scoreInterval;
let spawnBombTimeout;
let spawnShieldTimeout;
let obstacles = [];
let loop;
let activeShield;

const playerPaddingX = 40;
const playerPaddingY = 40;
const obstaclePaddingX = 25;
const obstaclePaddingY = 30;

// FUNÇÃO JUMP
const jump = () => {
  if (gamestate !== 'playing') return;
  if (player.classList.contains('jump')) return;

  player.classList.remove('jump');
  void player.offsetWidth;

  player.classList.add('jump');

  setTimeout(() => {
    player.classList.remove('jump');
  }, 500);
};

// LISTENERS DO TECLADO
document.addEventListener('keydown', (e) => {
  if (e.key === 'r' && gamestate === 'gameover') {
    Reiniciar();
  }

  if (e.key === 'Enter' && gamestate === 'gameover') {
    Reiniciar();
  }

  if ((e.key === 'ArrowUp' || e.key === ' ') && gamestate === 'playing') {
    jump();
  }
});

// LISTENERS DOS BUTTONS/CLICKS
telaGame.addEventListener('click', () => {
  if (gamestate === 'playing') {
    jump();
  }
});

btnRestart.addEventListener('click', (e) => {
  e.stopPropagation();
  if (gamestate === 'gameover') {
    Reiniciar();
  }
});  

btnTutorial.addEventListener('click', () => {
  if (!gamediff) {
    exibeDiff.style.visibility = 'visible';
    exibeDiff.innerText = 'Escolha uma dificuldade!';
    return;
  }  
  Tutorial();
});  

btnStart.addEventListener('click', () => {
  if (gamestate === 'tutorial') {
    IniciarJogo();
  }  
});  

// LISTENERS DIFICULDADES
easy.addEventListener('click', () => {
  DefinirDificuldade('easy');
  localStorage.setItem('jumpDifficulty', 'easy');
});

medium.addEventListener('click', () => {
  DefinirDificuldade('medium');
  localStorage.setItem('jumpDifficulty', 'medium');
});

hard.addEventListener('click', () => {
  DefinirDificuldade('hard');
  localStorage.setItem('jumpDifficulty', 'hard');
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
    gameDisplayDiff.innerText = 'Fácil';
    gameDisplayDiff.style.color = 'lightgreen';
  }
  
  if (diff === 'medium') {
    medium.classList.add('btn-selected');
    exibeDiff.style.color = 'yellow';
    exibeDiff.innerText = 'Modo Médio';
    gameDisplayDiff.innerText = 'Médio';
    gameDisplayDiff.style.color = 'orange';
  }
  
  if (diff === 'hard') {
    hard.classList.add('btn-selected');
    exibeDiff.style.color = 'red';
    exibeDiff.innerText = 'Modo Difícil';
    gameDisplayDiff.innerText = 'Difícil';
    gameDisplayDiff.style.color = 'red';
  }

  exibeDiff.style.visibility = 'visible';
}

function Tutorial() {
  gamestate = 'tutorial';

  telaInicio.style.display = 'none';
  telaGame.style.display = 'none';
  telaTutorial.style.display = 'block';
}

function IniciarJogo() {
  clearInterval(loop);
  clearInterval(scoreInterval);
  clearTimeout(spawnBombTimeout);
  clearTimeout(spawnShieldTimeout);

  gamestate = 'playing';
  score = 0;
  scoreEl.innerText = `${score} metros`;
  activeShield = false;

  obstacles = [];

  telaInicio.style.display = 'none';
  telaTutorial.style.display = 'none';
  telaGame.style.display = 'block';

  // SCORE LOOP
  scoreInterval = setInterval(() => {
    if (gamestate === 'playing') {
      score++;
      scoreEl.innerText = `${score} metros`;
    }
  }, 200);

  loop = setInterval(() => {
    if (gamestate !== 'playing') return;

    const playerRect = player.getBoundingClientRect();
    const playerHitbox = {
      left: playerRect.left + 60 + playerPaddingX,
      right: playerRect.right - 10 - playerPaddingX,
      top: playerRect.top + 20 + playerPaddingY,
      bottom: playerRect.bottom + 20 - playerPaddingY,
    };

    // const containerRect = telaGame.getBoundingClientRect();
    // const debugPlayer = document.getElementById('debugPlayer');
    // debugPlayer.style.left = (playerHitbox.left - containerRect.left) + 'px';
    // debugPlayer.style.top = (playerHitbox.top - containerRect.top) + 'px';
    // debugPlayer.style.width = (playerHitbox.right - playerHitbox.left) + 'px';
    // debugPlayer.style.height = (playerHitbox.bottom - playerHitbox.top) + 'px';

    const diffMultiplier = difficultyMultiplier[gamediff] || 1;

    obstacles.forEach((obs, index) => {
      
      if(obs.type === 'shield') obs.x -= obs.baseSpeed;

      else {obs.x -= obs.baseSpeed * diffMultiplier * (1 + score / 300)};
      
      obs.element.style.left = obs.x + 'px';

      const obstacleRect = obs.element.getBoundingClientRect();
      const obstacleHitbox = {
        left: obstacleRect.left + obstaclePaddingX,
        right: obstacleRect.right - obstaclePaddingX,
        top: obstacleRect.top + obstaclePaddingY,
        bottom: obstacleRect.bottom - obstaclePaddingY,
      };

      // const debugObstacle = document.getElementById('debugObstacle');
      // debugObstacle.style.left = (obstacleHitbox.left - containerRect.left) + 'px';
      // debugObstacle.style.top = (obstacleHitbox.top - containerRect.top) + 'px';
      // debugObstacle.style.width = (obstacleHitbox.right - obstacleHitbox.left) + 'px';
      // debugObstacle.style.height = (obstacleHitbox.bottom - obstacleHitbox.top) + 'px';

      // COLLISION LOOP
      const collision =         
        obstacleHitbox.left < playerHitbox.right &&
        obstacleHitbox.right > playerHitbox.left &&
        obstacleHitbox.top < playerHitbox.bottom &&
        obstacleHitbox.bottom > playerHitbox.top;

      if (collision) {
        
        if (obs.type === 'shield') { 
          GiveShield(obs);
          return;
        }

        if (obs.type === 'bomb') {
          
          if(activeShield) {
            
            const containerRect = telaGame.getBoundingClientRect();

            BreakShieldEffect(
              playerRect.left - containerRect.left + playerRect.width / 2,
              playerRect.top - containerRect.top + playerRect.height / 2
            );

            activeShield = false;
            player.classList.remove("shield-active")
            obs.element.remove();
            obstacles.splice(index, 1);

            return;
          } 

          GameOver(obs);
        }
      }

      if (obs.x < -100) {
        obs.element.remove();
        obstacles.splice(index, 1);
      }
    });
  }, 16);

  SpawnBomb();
  
  const firstShieldSpawn = Math.random() * 6000 + 1000;
  spawnShieldTimeout = setTimeout(SpawnShield, firstShieldSpawn);
}

function SpawnBomb() {
  if (gamestate !== 'playing') return;

  const obstacle = document.createElement('img');

  obstacle.src = 'assets/images/dinamite-barrel.png';
  obstacle.classList.add('obstacle');  
  obstacle.style.left = window.innerWidth + 'px';

  telaGame.appendChild(obstacle);

  obstacles.push({
    element: obstacle,
    x: window.innerWidth,
    baseSpeed: 24,
    type: 'bomb',
  });

  const spawnDiffBase = spawnMultiplier[gamediff] || spawnMultiplier.medium;

  const nextSpawn = Math.random() * (spawnDiffBase.max - spawnDiffBase.min) + spawnDiffBase.min;
  spawnBombTimeout = setTimeout(SpawnBomb, nextSpawn);

}

function SpawnShield() {
  if (gamestate !== 'playing') return;
  if (activeShield) return;

  const obstacle = document.createElement('img');

  obstacle.src = 'assets/images/powerup-shield.png';
  obstacle.classList.add('shield');  
  obstacle.style.left = window.innerWidth + 'px';

  telaGame.appendChild(obstacle);

  obstacles.push({
    element: obstacle,
    x: window.innerWidth,
    baseSpeed: 12,
    type: 'shield',
  });

  const nextSpawn = Math.random() * 10000 + 7000;
  spawnShieldTimeout = setTimeout(SpawnShield, nextSpawn);
}

function GiveShield(obs) {

  activeShield = true;
  obs.element.classList.add('shield-collected')
  player.classList.add('shield-active');
}

function BreakShieldEffect(x, y) {

  const effect = document.createElement("div");
  effect.classList.add("shield-break");

  effect.style.left = x + "px";
  effect.style.top = y + "px";

  telaGame.appendChild(effect);

  setTimeout(() => {
    effect.remove();
  }, 350);
}

function GameOver(obs) {
  gamestate = 'gameover';

  clearInterval(loop);
  clearInterval(scoreInterval);
  clearTimeout(spawnBombTimeout);
  clearTimeout(spawnShieldTimeout);

  const obstacleHit = obs.element.offsetLeft;
  const playerPos = parseFloat(getComputedStyle(player).bottom);

  player.classList.add('dead');
  player.classList.remove('jump');
  player.style.animation = 'none';
  player.style.bottom = `${playerPos}px`;
  obs.element.style.animation = 'none';
  result.style.visibility = 'visible';
  result.innerHTML = `Você alcançou <strong class="highlight2">${score} metros</strong>!`;
  
  btnRestart.style.visibility = 'visible';
  btnMenu.style.visibility = 'visible';

  obs.element.classList.add('destroyed');
  obs.element.style.left = `${obstacleHit}px`;
  explosion.style.visibility = 'visible';
  explosion.style.left = `${obstacleHit - 150}px`;

}

function Reiniciar() {
  clearInterval(loop);
  clearInterval(scoreInterval);
  clearTimeout(spawnShieldTimeout);
  clearTimeout(spawnBombTimeout);

  obstacles.forEach((obs) => obs.element.remove());
  obstacles = [];

  result.style.visibility = 'hidden';
  explosion.style.visibility = 'hidden';
  player.classList.remove('dead');
  player.style.bottom = '15px';
  player.style.animation = '';

  IniciarJogo();
}

window.addEventListener('DOMContentLoaded', () => {
  const savedDiff = localStorage.getItem('jumpDifficulty');

  if (savedDiff) {
    DefinirDificuldade(savedDiff);
  }
});

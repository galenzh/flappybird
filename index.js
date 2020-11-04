var Util = {
  checkCollision: function(rect1, rect2) {
    if (rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y) {
        return true;
    }
    return false;
  }
}
function Game() {
  this.sky = new Sky();
  this.land = new Land();
  this.pipe = [new Pipe(0), new Pipe(1)];
  this.bird = new Bird();
  this.control = new Control();
  this.scorePanel = new Score();
  this.gameOver = document.getElementById('gameover');
  this.score = 0;
  this.isRunning = false;
  this.isCrashing = false;
  this.counter = 0;
  this.preStamp = 0;
}
Game.WIDTH = 288;
Game.HEIGHT = 400;
Game.prototype.init = function() {
  var game = this;
  function loop(stamp) {
    game.preStamp = stamp;
    game.update();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
Game.prototype.reset = function() {
  this.isRunning = false;
  this.score = 0;
  this.pipe.forEach(pipe => pipe.reset());
  this.bird.reset();
  this.control.reset();
  this.scorePanel.hide();
}
Game.prototype.start = function() {
  this.counter = -50; //delay the appearance of pipes
  this.isRunning = true;
  this.bird.dom.style.left = this.bird.x + 'px';
  this.scorePanel.show();
}
Game.prototype.stop = function() {
  this.isRunning = false;
}
Game.prototype.update = function() {
  if(this.isRunning) {
    this.sky.update();
    this.land.update();
    this.bird.update();
    if(this.counter % 360 === 0) {
      this.pipe[0].random();
    }
    if((this.counter + 180) % 360 === 0) {
      this.pipe[1].random();
    }
    this.pipe.forEach(pipe => pipe.update());
    if(this.counter % 180 === 0 && this.counter > 0) {
      this.score++;
    }
    this.scorePanel.setScore(this.score);
    if(this.checkCollision()) {
      this.isRunning = false;
      this.isCrashing = true;
      this.bird.crash();
      this.shake();
      setTimeout(() => {
        this.gameOver.style.display = 'block';
        this.isCrashing = false;
      }, 1000);
    }
    this.counter++;
  }
}
Game.prototype.checkCollision = function() {
  if(this.bird.y > 370) { //check if the bird is down on the land
    return true;
  }
  for(var i=0; i<this.pipe.length; i++) {
    var pipe = this.pipe[i];
    if(Util.checkCollision(this.bird, {
      x: pipe.x,
      y: pipe.y,
      width: pipe.width,
      height: pipe.height
    })) {
      return true;
    }
    if(Util.checkCollision(this.bird, {
      x: pipe.x,
      y: pipe.y + 288 + 100,
      width: pipe.width,
      height: pipe.height
    })) {
      return true;
    }
  }
  return false;
}
Game.prototype.shake = function() {
  var dom = document.getElementsByTagName('body')[0];
  dom.className = '';
  setTimeout(function() {
    dom.className = 'shake';
  });
}

function Sky() {
  this.x = 0;
  this.speed = 0.5;
  this.dom = document.getElementById('sky');
}
Sky.prototype.update = function() {
  this.x += this.speed;
  if(this.x > Game.WIDTH) {
    this.x = 0;
  }
  this.dom.style.transform = 'translateX('+-this.x+'px)';
}
function Land() {
  this.x = 0;
  this.speed = 1.2;
  this.dom = document.getElementById('land');
}
Land.prototype.update = function() {
  this.x += this.speed;
  if(this.x > Game.WIDTH) {
    this.x = 0;
  }
  this.dom.style.transform = 'translateX('+-this.x+'px)';
}
function Pipe(num) {
  this.x = -100;
  this.y = 0;
  this.width = 40;
  this.height = 280;
  this.speed = 1.2;
  this.domUp = document.getElementById('pipeUp' + num);
  this.domDown = document.getElementById('pipeDown' + num);
}
Pipe.prototype.random = function() {
  this.x = Game.WIDTH;
  this.y = -200 + Math.random() * 140; //-200 is the minium value of top pipe
}
Pipe.prototype.update = function() {
  this.x -= this.speed;
  this.domUp.style.transform = 'translate('+this.x+'px,'+this.y+'px)';
  this.domDown.style.transform = 'translate('+this.x+'px,'+(this.y + 288 + 100) +'px)';//288 is top pipe, 200 is the space between top and down pipe.
}
Pipe.prototype.reset = function() {
  this.x = -100;
  this.update();
}
function Bird() {
  this.x = 100;
  this.y = 180;
  this.degree = 10;
  this.width = 35;
  this.height = 24;
  this.speed = 0;
  this.a = 0.2;
  this.dom = document.getElementById('bird');
  this.wingDom = document.getElementById('wing');
  this.crashDom = document.getElementById('crash');
  this.hitDom = document.getElementById('hit');
  this.dom.style.left = this.x + 'px';
  this.dom.addEventListener('animationend', () => {
    this.dom.style.display = 'none';
  });
}
Bird.prototype.update = function() {
  this.x = 100;
  this.speed += this.a;
  this.y += this.speed;
  if(this.y < 0) {
    this.y = 0;
    this.speed = 0;
  }
  if(this.degree>-15 && this.speed<0) {
    this.degree += -1;
  } else if(this.degree<90 && this.speed>0) {
    this.degree += 1;
  }
  this.dom.style.transform = 'translateY('+this.y+'px) rotate('+this.degree+'deg)';
}
Bird.prototype.jump = function() {
  this.speed = -5.5;
  this.degree = 0;
  this.wingDom.play();
}
Bird.prototype.crash = function() {
  this.dom.className = 'bird crashing';
  this.degree = 90;
  this.dom.style.transform = 'translateY('+this.y+'px) rotate('+this.degree+'deg)';
  this.hitDom.play();
  this.crashDom.play();
}
Bird.prototype.reset = function() {
  this.y = 180;
  this.speed = 0;
  this.dom.style.transform = 'translateY('+this.y+'px)';
  this.dom.style.left = 130 + 'px';
  this.dom.className = 'bird';
  this.dom.style.display = 'block';
}
function Control() {
  this.title = document.getElementById('title');
  this.start = document.getElementById('start');
  this.gameOver = document.getElementById('gameOver');

  this.start.addEventListener('click', () => {
    game.start();
    this.play();
  });
}
Control.prototype.reset = function() {
  this.title.style.display = 'block';
  this.start.style.display = 'block';
}
Control.prototype.play = function() {
  this.title.style.display = 'none';
  this.start.style.display = 'none';
}
function Score() {
  this.dom = document.getElementById('score');
}
Score.prototype.setScore = function(score) {
  this.dom.innerHTML = score;
}
Score.prototype.show = function() {
  this.dom.style.display = 'block';
}
Score.prototype.hide = function() {
  this.dom.innerHTML = 0;
  this.dom.style.display = 'none';
}

var game = new Game();
game.init();
game.reset();
document.addEventListener('click', function(event){
  event.preventDefault();
  if(game.isRunning) {
    game.bird.jump();
  } else if(!game.isRunning && !game.isCrashing) {
    game.reset();
    game.gameOver.style.display = 'none';
  }
});

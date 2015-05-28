function Thing(board, x, y) {
  this.x = x;
  this.y = y;
  this.board = board;
  this.step = null;

  this.turn = function() {}

  this.canMoveUp = function() {
    var varCanMoveUp = true
    for (var i = 0; i <= this.width; i++) {
      if (this.board.isBlocked(this.x + i, this.y - 1)) {
        varCanMoveUp = false;
      }
    }
    return (varCanMoveUp);
  }

  this.blockedUp = function(y) {
    var blockedUp = false
    for (var i = 0; i <= this.width; i++) {
      if (this.board.isBlocked(this.x + i, y)) {
        blockedUp = true;
      }
    }
    return (blockedUp);
  }

  this.falling = function() {
    return !this.onGround()
  }

  this.onGround = function() {
    var onGround = false
    for (var i = 0; i <= this.width; i++) {
      if (this.board.isBlocked(this.x + i, this.y + this.height + 1)) {
        onGround = true;
      }
    }
    return (onGround);
  }

  this.towardsGround = function(y) {
    var onGround = false
    for (var i = 0; i <= this.width; i++) {
      if (this.board.isBlocked(this.x + i, y)) {
        onGround = true;
      }
    }
    return (onGround);
  }

  this.againstLeftLine = function() {
    var avaliableSteps = 0;
    var varLeftLine = false
    for (var i = 1; i <= 4; i++) {
      for (var j = 0; j <= this.height; j++) {
        if (this.board.isBlocked(this.x - i, this.y + j)) {
          if (!this.board.isBlocked(this.x - avaliableSteps, this.y + j)) {
            avaliableSteps += 1
          }
        }
        if (this.board.isBlocked(this.x - i, this.y + j)) {
          var used = avaliableSteps
          avaliableSteps = 0
          varLeftLine = true;
          break;
        }
      }
    }
    return (varLeftLine);
  }

  this.againstRightLine = function() {
    var avaliableSteps = 0;
    var varRightLine = false
    for (var i = 1; i <= 4; i++) {
      for (var j = 0; j <= this.height; j++) {
        if (this.board.isBlocked(this.x + this.width + i, this.y + j)) {
          var used = avaliableSteps
          varRightLine = true;
          break;
        }
      }
    }
    return (varRightLine);
  }

  this.getClose = function(steps, direction) {
    if (steps < 0 && direction === "left") {
      steps *= -1
      this.x -= (steps - 1)
    } else if (steps > 0 && direction === "right") {
      steps *= 1
      this.x += (steps + this.width - 1)
    }
  }

  this.within = function(thing) {
    if ((this.x - thing.width + 1 <= thing.x && this.x + this.width - 1 >= thing.x) &&
      (this.y - thing.height + 1 <= thing.y && this.y + this.height - 1 >= thing.y)) {
        return true;
    } else {
      return false;
    }
  }
} // end of Thing

function getMilliseconds() {
  return new Date().getTime();
}

function Man(board, x, y, height, width, colour) {
  this.x = x;
  this.y = y - height;
  this.board = board;
  this.lineAbove = false;
  this.lineBelow = false;
  this.height = height;
  this.width = width;
  this.colour = colour
  this.upForce = 0;
  this.downForce = 0;
  this.jumps = false;
  this.currentlyJumping = false
  this.jumping = false;
  this.falling = false;
  this.counter = 0;
  this.direction = 0;
  this.xChange = 0;
  this.lastBulletTime = null;
  this.lastXChange = 1;
  this.bullets = 10
  this.step = 4;

  this.draw = function() {
    //body
    this.board.context.fillStyle = this.colour;
    this.board.context.fillRect(this.x, this.y, this.width, this.height)
    this.board.context.font = "20px Verdana"
    if (this.board.men.indexOf(this) === 0) {
      this.board.context.fillText("Player One: " + this.bullets, this.x - 55, this.y - 3)
    } else {
      this.board.context.fillText("Player Two: " + this.bullets, this.x - 60, this.y - 3)
    }
  }

  this.bulletDirection = function(man) {
    if (man.lastXChange === 1) {
      return (man.width + 1)
    } else {
      return (-5)
    }
  }

  this.removeAllBullets = function() {
    for (var i = this.board.bullets.length - 1; i >= 0; i--) {
      this.board.removeBullet(this.board.bullets[i])
    }
  }

  this.bulletNotInLine = function(bullet, x) {
    if (this.board.isBlocked(bullet.x + x, bullet.y)) {
      return false;
    } else {
      return true;
    }
  }

  this.testForTagWithBullet = function(b) {
    if (this.board.men[0].colour === "red") {
      var m = this.board.men[1]
      if (b.x - 4 >= m.x && b.x <= m.x + m.width - 1 && b.y + 3 >= m.y && b.y <= m.y + m.height - 1) {
        return true
      }
    } else {
      var m = this.board.men[0]
      if (b.x - 4 >= m.x && b.x <= m.x + m.width - 1 && b.y + 3 >= m.y && b.y <= m.y + m.height - 1) {
        return true
      }
    }
    return false
  }

  this.shoot = function(man) {
    if (this.lastBulletTime == null || this.lastBulletTime < (getMilliseconds() - 150)) {
      this.bullets -= 1
      var bullet = new Bullet(board, man.x + this.bulletDirection(man), man.y + man.width / 2, man.lastXChange)
      this.board.addBullet(bullet);
      this.lastBulletTime = getMilliseconds();
    }
  }

  this.turn = function() {
    var readyToRemoveBullet = false
    if (this.board.men[1].colour === "red") {
      this.board.men[0].bullets = 0
    } else {
      this.board.men[1].bullets = 0
    }
    for (var i = 0; i < this.board.bullets.length; i++) {
      if (this.bulletNotInLine(this.board.bullets[i], this.board.bullets[i].direction * 2)) {
        this.board.bullets[i].x += this.board.bullets[i].direction * 2.5
      } else {
        this.board.bullets[i].counter += 1
      }
      if (this.board.bullets[i].counter > 200) {
        readyToRemoveBullet = true
      }
      if (this.testForTagWithBullet(this.board.bullets[i])) {
        this.board.toBeIn = true
      }
      if (readyToRemoveBullet) {
        this.board.removeBullet(this.board.bullets[i])
      }
    }
    if (this.bullets > 0) {
      if (this.board.keyMap["49"] && this.board.men[1].colour === "red") {
        this.shoot(this.board.men[1])
      } else if (this.board.keyMap["32"] && this.board.men[0].colour === "red") {
        this.shoot(this.board.men[0])
      }
    }
    if (this.board.men[0].within(this.board.men[1])) {
      this.board.changeTag = true
    } else {
      this.board.changeTag = false
    }
    if (this.board.changeTag) {
      this.board.toBeIn = true
    }
    if (this.board.toBeIn && !this.board.changeTag) {
      this.removeAllBullets()
      if (this.board.men[1].colour === "red") {
        this.board.men[0].colour = "red"
        this.board.men[0].bullets = 10
        this.board.men[1].colour = "purple"
        this.board.men[1].bullets = 0
        this.board.toBeIn = false;
      } else if (this.board.men[0].colour === "red") {
        this.board.men[0].colour = "blue"
        this.board.men[0].bullets = 0
        this.board.men[1].colour = "red"
        this.board.men[1].bullets = 10
        this.board.toBeIn = false;
      }
    }
    if (this.jumps && !this.currentlyJumping) {
      this.upForce = 18;
      this.jumping = true;
      this.currentlyJumping = true;
    }
    if (this.currentlyJumping) {
      this.jumps = false;
    }
    if (this.onGround() && this.currentlyJumping) {
      this.currentlyJumping = false;
    }
    if (this.falling && this.upForce > 0) {
      this.upForce = 0;
      this.jumping = false;
    }
    if (!this.onGround() && !this.jumping) {
      this.falling = true;
      this.downForce = 1;
    } else {
      this.falling = false;
      this.downForce = 0;
    }
    if (this.jumping) {
      var oldUpForce = this.upForce
      this.upForce = Math.floor(oldUpForce * .89);
      var canMoveUpForceUp = true
      for (var i = 0; i < this.height; i++) {
        if (this.blockedUp(this.y - this.upForce + i)) {
          canMoveUpForceUp = false
          break;
        }
      }
      if (canMoveUpForceUp && this.canMoveUp() && this.upForce > 0) {
        this.y -= this.upForce
      } else if (!canMoveUpForceUp && this.canMoveUp() && this.upForce > 0) {
        this.y -= 1
      } else {
        this.counter += 2;
      }
      if (this.counter > 10) {
        this.counter = 0;
        this.downForce = 1
        this.jumping = false
        this.falling = true
      }
    }
    if (this.falling) {
      this.counter += 0.1
      var canMoveDownForceDown = true
      for (var i = 0; i <= this.height + 1; i++) {
        if (this.towardsGround(this.y + (this.downForce * this.counter) + i)) {
          canMoveDownForceDown = false;
          break;
        }
      }

      if (canMoveDownForceDown) {
        this.y += this.downForce * this.counter;
      } else if (!canMoveDownForceDown && !this.onGround()) {
        this.y += 1;
      }
      if (this.onGround()) {
        this.falling = false;
        this.currentlyJumping = false;
        this.counter = 0;
        this.downForce = 0
      }
    }

    if ((this.xChange < 0 && !this.againstLeftLine()) ||
    (this.xChange > 0 && !this.againstRightLine())) {
      this.x += this.xChange * this.step;
      this.direction = this.xChange
    }
    this.xChange = 0;
  }

  this.jump = function() {
    this.jumps = true;
  }

  this.moveleft = function() {
    this.xChange = -1;
    this.lastXChange = -1;
  }

  this.moveright = function() {
    this.xChange = 1;
    this.lastXChange = 1;
  }

}

Man.prototype = new Thing()

function Line(board, x, y, width, height) {
  this.board = board
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;

  this.draw = function() {
    this.board.context.fillStyle = "black";
    this.board.context.fillRect(this.x, this.y, this.width, this.height)
  }
}

Line.prototype = new Thing()

function Bullet(board, x, y, direction) {
  this.board = board
  this.x = x;
  this.y = y;
  this.counter = 0;
  this.direction = direction;
  this.lastBulletTime = null;
  this.counter = 0;

  this.draw = function() {
    this.board.context.fillStyle = "white";
    this.board.context.fillRect(this.x, this.y, 5, 2)
  }
}

Bullet.prototype = new Thing()

function Board(width, height, pixelWidth, context) {
  this.changeTag = false;
  this.toBeIn = false;
  this.width = width;
  this.height = height;
  this.pixelWidth = pixelWidth;
  this.context = context;
  this.things = new Array()
  this.context.canvas.width = width;
  this.context.canvas.height = height;
  this.context.canvas.style.width = '' + (width * pixelWidth)  + 'px';
  this.context.canvas.style.height = '' + (height * pixelWidth) + 'px';
  this.keyMap = [];
  this.men = [];
  this.lines = [];
  this.elevators = [];
  this.spikes = [];
  this.bullets = [];
  this.names = [];

  this.add = function(thing) {
    this.things.push(thing);
  }

  this.remove = function(thing) {
    var index = this.things.indexOf(thing)
    if (index > -1) {
      this.things.splice(index, 1);
    }
  }

  this.removeBullet = function(bullet) {
    var index = this.bullets.indexOf(bullet)
    if (index > -1) {
      this.bullets.splice(index, 1);
    }
    this.remove(bullet);
  }

  this.addMan = function(man) {
    this.men.push(man);
  }

  this.addLines = function(line) {
    this.lines.push(line);
    this.add(line);
  }

  this.addBullet = function(bullet) {
    this.bullets.push(bullet);
    this.add(bullet);
  }

  this.drawCells = function() {
    this.clearBoard()
    for (var i = 0; i< this.things.length; i++) {
      this.things[i].draw()
    }
  }

  this.clearBoard = function() {
    this.context.clearRect(0, 0, this.width, this.height)
  }

  this.isBlocked = function(x, y) {
    for (var i = 0; i < this.lines.length; i++) {
      if ((x >= this.lines[i].x && x <= (this.lines[i].x + this.lines[i].width)) &&
      (y >= this.lines[i].y && y <= (this.lines[i].y + this.lines[i].height))) {
        return true;
      }
    }
    return false;
  }

  this.turn = function() {
    for (var i = 0; i < this.things.length; i++) {
      this.things[i].turn()
    }
    if (this.keyMap['38']) {
      this.men[0].jump();
    }
    if (this.keyMap['37']) {
      this.men[0].moveleft();
    }
    if (this.keyMap['39']) {
      this.men[0].moveright();
    }
    if (this.keyMap['87']) {
      this.men[1].jump();
    }
    if (this.keyMap['65']) {
      this.men[1].moveleft();
    }
    if (this.keyMap['68']) {
      this.men[1].moveright();
    }
  }

  this.keyUpDown = function(e){
    e = e || event; // to deal with IE
    board.keyMap[e.keyCode] = e.type == 'keydown';
  }
}

var getBoard = function() {
  var canvas = document.getElementById("myCanvas")
  var context = canvas.getContext("2d");

  return(new Board(1000, 500, 1, context));
}

var board = null;

var start = function() {
  board = getBoard()//new Board(1000, 500, 1, context);

  var line = new Line(board, board.width / 2 - 240, board.height - 20, 25, 5)
  var line2 = new Line(board, board.width / 2 - 180, board.height - 50, 25, 5)
  var line3 = new Line(board, board.width / 2 - 110, board.height - 80, 25, 5)
  var line4 = new Line(board, board.width / 2 - 60, board.height - 110, 25, 5)
  var line5 = new Line(board, board.width / 2, board.height - 140, 25, 5)
  var line6 = new Line(board, board.width / 2 + 60, board.height - 170, 25, 5)
  var line7 = new Line(board, board.width / 2 + 180, board.height - 175, 25, 5)
  var line8 = new Line(board, board.width / 2 + 280, board.height - 210, 25, 5)
  var lineblock = new Line(board, board.width / 2 + 380, board.height - 240, 80, 220)

  var block = new Line(board, 0, board.height - 120, 50, 120)
  var block2 = new Line(board, 40, board.height - 80, 50, 80)
  var block3 = new Line(board, 80, board.height - 40, 50, 40)

  var top = new Line(board, 0, 0, board.width, 1)
  var bottom = new Line(board, 0, board.height - 1, board.width, 1)
  var left = new Line(board, 0, 0, 1, board.height)
  var right = new Line(board, board.width - 1, 0, 1, board.height)

  var man1X = Math.floor(Math.random() * (board.width / 2)) + 50
  var man2X = Math.floor(Math.random() * (board.width / 2)) + 500

  var man1 = new Man(board, man1X, 50, 16, 9, "blue")
  var man2 = new Man(board, man2X, 50, 16, 9, "red")

  board.add(man1);
  board.addMan(man1);

  board.add(man2);
  board.addMan(man2);

  board.addLines(line);
  board.addLines(line2);
  board.addLines(line3);
  board.addLines(line4);
  board.addLines(line5);
  board.addLines(line6);
  board.addLines(line7);
  board.addLines(line8);
  board.addLines(lineblock);

  board.addLines(block);
  board.addLines(block2);
  board.addLines(block3);

  board.addLines(top);
  board.addLines(bottom);
  board.addLines(left);
  board.addLines(right);


  document.onkeydown = board.keyUpDown;
  document.onkeyup = board.keyUpDown;

  setInterval(function() {
    board.drawCells();
  }, 1000 / 60);

  setInterval(function() {
    board.turn()
  }, 1000 / 60);
}

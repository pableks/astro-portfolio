// Global Variables
var DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

var colors = ['#13151a', '#13151a', '#13151a', '#13151a', '#13151a'];
 
// The ball object (The cube that bounces back and forth)
var Ball = {
    new: function (incrementedSpeed) {
        return {
            width: 18,
            height: 18,
            x: (this.canvas.width / 2) - 9,
            y: (this.canvas.height / 2) - 9,
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: incrementedSpeed || 20
        };
    }
};
 
// The ai object (The two lines that move up and down)
var Ai = {
    new: function (side) {
        return {
            width: 18,
            height: 180,
            x: side === 'left' ? 150 : this.canvas.width - 150,
            y: (this.canvas.height / 2) - 35,
            score: 0,
            move: DIRECTION.IDLE,
            speed: 20
        };
    }
};
 
var Game = {
    initialize: function () {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
 
        this.canvas.width = 1200;
        this.canvas.height = 1000;
 
        this.canvas.style.width = (this.canvas.width / 4) + 'px';
        this.canvas.style.height = (this.canvas.height / 4) + 'px';
 
        this.player = Ai.new.call(this, 'left');
        this.ai = Ai.new.call(this, 'right');
        this.ball = Ball.new.call(this);
 
        this.ai.speed = 20;
        this.running = this.over = false;
        this.turn = this.ai;
        this.timer = this.round = 0;
        this.color = '#13151a';
 
        Pong.menu();
        Pong.listen();
    },
 
    endGameMenu: function (text) {
        // Change the canvas font size and color
        Pong.context.font = '45px Courier New';
        Pong.context.fillStyle = this.color;
 
        // Draw the rectangle behind the 'Press any key to begin' text.
        Pong.context.fillRect(
            Pong.canvas.width / 2 - 350,
            Pong.canvas.height / 2 - 48,
            700,
            100
        );
 
        // Change the canvas color;
        Pong.context.fillStyle = '#ffffff';
 
        // Draw the end game menu text ('Game Over' and 'Winner')
        Pong.context.fillText(text,
            Pong.canvas.width / 2,
            Pong.canvas.height / 2 + 15
        );
 
        setTimeout(function () {
            Pong = Object.assign({}, Game);
            Pong.initialize();
        }, 3000);
    },

    menu: function () {
        // Draw all the Pong objects in their current state
        Pong.draw();
    
        // Change the canvas font size and color
        this.context.font = '50px Courier New';
        this.context.fillStyle = this.color;
    
        // Draw the rectangle behind the 'Touch to begin' text.
        this.context.fillRect(
            this.canvas.width / 2 - 350,
            this.canvas.height / 2 - 48,
            700,
            100
        );
    
        // Change the canvas color;
        this.context.fillStyle = '#ffffff';
    
        // Draw the 'touch to begin' text
        this.context.fillText('Touch to begin',
            this.canvas.width / 2,
            this.canvas.height / 2 + 15
        );
    
        var canvas = document.querySelector('canvas');
        canvas.addEventListener('touchstart', startGame);
    
        function startGame(e) {
            if (Pong.running === false) {
                Pong.running = true;
                window.requestAnimationFrame(Pong.loop);
                canvas.removeEventListener('touchstart', startGame);
            }
        }
    },
 
    // Update all objects (move the player, ai, ball, increment the score, etc.)
    update: function () {
        if (!this.over) {
            // If the ball collides with the bound limits - correct the x and y coords.
            if (this.ball.x <= 0) Pong._resetTurn.call(this, this.ai, this.player);
            if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player, this.ai);
            if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;
 
            // Move player if they player.move value was updated by a keyboard event
            if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
            else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;
 
            // On new serve (start of each turn) move the ball to the correct side
            // and randomize the direction to add some challenge.
            if (Pong._turnDelayIsOver.call(this) && this.turn) {
                this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
                this.turn = null;
            }
 
            // If the player collides with the bound limits, update the x and y coords.
            if (this.player.y <= 0) this.player.y = 0;
            else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);
 
            // Move ball in intended direction based on moveY and moveX values
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
            if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
            else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;
 
            // Handle ai (AI) UP and DOWN movement
            if (this.ai.y > this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y -= this.ai.speed / 1.5;
                else this.ai.y -= this.ai.speed / 4;
            }
            if (this.ai.y < this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y += this.ai.speed / 1.5;
                else this.ai.y += this.ai.speed / 4;
            }
 
            // Handle ai (AI) wall collision
            if (this.ai.y >= this.canvas.height - this.ai.height) this.ai.y = this.canvas.height - this.ai.height;
            else if (this.ai.y <= 0) this.ai.y = 0;
 
            // Handle Player-Ball collisions
            if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
                if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
                    this.ball.x = (this.player.x + this.ball.width);
                    this.ball.moveX = DIRECTION.RIGHT;
 
                }
            }
 
            // Handle ai-ball collision
            if (this.ball.x - this.ball.width <= this.ai.x && this.ball.x >= this.ai.x - this.ai.width) {
                if (this.ball.y <= this.ai.y + this.ai.height && this.ball.y + this.ball.height >= this.ai.y) {
                    this.ball.x = (this.ai.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;
 
                }
            }
        }
 
        // Handle the end of round transition
        // Check to see if the player won the round.
        if (this.player.score === 5) {
            this.over = true;
            setTimeout(function () { Pong.endGameMenu('Lo lograste!! tkm'); }, 1000);
          }
        // Check to see if the ai/AI has won the round.
        else if (this.ai.score === 5) {
            this.over = true;
            setTimeout(function () { Pong.endGameMenu('Game Over!'); }, 1000);
          }
    },
 
    // Draw the objects to the canvas element
    draw: function () {
        // Clear the Canvas
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
 
        // Set the fill style to black
        this.context.fillStyle = this.color;
 
        // Draw the background
        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
 
        // Set the fill style to white (For the paddles and the ball)
        this.context.fillStyle = '#ffffff';
 
        // Draw the Player
        this.context.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );
 
        // Draw the Ai
        this.context.fillRect(
            this.ai.x,
            this.ai.y,
            this.ai.width,
            this.ai.height 
        );
 
        // Draw the Ball
        if (Pong._turnDelayIsOver.call(this)) {
            this.context.fillRect(
                this.ball.x,
                this.ball.y,
                this.ball.width,
                this.ball.height
            );
        }
 
        // Draw the net (Line in the middle)
        this.context.beginPath();
        this.context.setLineDash([7, 15]);
        this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
        this.context.lineTo((this.canvas.width / 2), 140);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();
 
        // Set the default canvas font and align it to the center
        this.context.font = '100px Courier New';
        this.context.textAlign = 'center';
 
        // Draw the players score (left)
        this.context.fillText(
            this.player.score.toString(),
            (this.canvas.width / 2) - 300,
            200
        );
 
        // Draw the paddles score (right)
        this.context.fillText(
            this.ai.score.toString(),
            (this.canvas.width / 2) + 300,
            200
        );
 
        // Change the font size for the center score text
        this.context.font = '30px Courier New';
 
        // Draw the winning score (center)
        this.context.fillText(
            'Alcanza 5 puntos' ,
            (this.canvas.width / 2),
            35
        );
        
 
        // Change the font size for the center score value
        this.context.font = '40px Courier';
 
        // Draw the current round number
        
    },
 
    loop: function () {
        Pong.update();
        Pong.draw();
 
        // If the game is not over, draw the next frame.
        if (!Pong.over) requestAnimationFrame(Pong.loop);
    },
 
    listen: function () {
        var canvas = document.querySelector('canvas');
        canvas.addEventListener('touchstart', handleTouchStart);
        canvas.addEventListener('touchmove', handleTouchMove);
        canvas.addEventListener('touchend', handleTouchEnd);
      
        var touchStartY = null;
      
        function handleTouchStart(e) {
          if (e.touches.length > 1) return;
          touchStartY = e.touches[0].clientY - canvas.getBoundingClientRect().top;
          e.preventDefault();
        }
      
        function handleTouchMove(e) {
          if (touchStartY === null) return;
      
          var touchCurrentY = e.touches[0].clientY - canvas.getBoundingClientRect().top;
          var touchDistance = touchCurrentY - touchStartY;
      
          // Increase the sensitivity by adjusting the threshold value
          var sensitivityThreshold = 1;
      
          if (touchDistance < 0 && Math.abs(touchDistance) > sensitivityThreshold) {
            Pong.player.move = DIRECTION.UP;
          } else if (touchDistance > 0 && Math.abs(touchDistance) > sensitivityThreshold) {
            Pong.player.move = DIRECTION.DOWN;
          } else {
            Pong.player.move = DIRECTION.IDLE;
          }
      
          e.preventDefault();
        }
      
        function handleTouchEnd(e) {
          touchStartY = null;
          Pong.player.move = DIRECTION.IDLE;
          e.preventDefault();
        }
      },

    
    
 
    // Reset the ball location, the player turns and set a delay before the next round begins.
    _resetTurn: function(victor, loser) {
        this.ball = Ball.new.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = (new Date()).getTime();
 
        victor.score++;
    },
 
    // Wait for a delay to have passed after each turn.
    _turnDelayIsOver: function() {
        return ((new Date()).getTime() - this.timer >= 1000);
    },
 
    // Select a random color as the background of each level/round.
    _generateRoundColor: function () {
        var newColor = colors[Math.floor(Math.random() * colors.length)];
        if (newColor === this.color) return Pong._generateRoundColor();
        return newColor;
    }
};
 
var Pong = Object.assign({}, Game);
Pong.initialize();
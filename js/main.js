// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
      || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
                                 timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
}());

/*jslint browser: true, devel: true, white: true */
/* http://old.jslint.com/ */

/**
    The MIT License (MIT)

    Copyright (c) 2015 Bas Groothedde

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
*/

// models
(function(root) {
  'use strict';

  var Font = function Font(name, size) {
    this.size   = size || 12;
    this.name   = name;
    this.weight = "normal"; 
  };

  Font.prototype.toString = function() {
    return this.weight + ' ' + this.size + "px '" + this.name + "'";
  };

  root.Font = Font;
}(window));

(function(root) {
  'use strict';

  /**
     * Used to determine the position, type, lifetime and birthtime of Food.
     * The SnakeController manages expiring food and placing new food. 
     */
  var FoodModel = function FoodModel() {
    this.init(new Position2D(0, 0));
  };

  FoodModel.prototype.init = function(position, type) {
    this.position = position;
    this.type     = type || 0;
    this.life     = 15000;
    this.birth    = Date.now();
    this.age      = 0;
  };

  root.FoodModel = FoodModel;
}(window));

(function(root) {
  'use strict';

  /**
     * Holds information about key states, updated by KeyboardController.
     */
  var KeyboardModel = function KeyboardModel() {
    this.pressedKeys = {};
    this.blockedKeys = {};
    this.modifiers = {
      control: false,
      alt: false,
      shift: false
    };
  };

  root.KeyboardModel = KeyboardModel;
}(window));

(function(root) {
  'use strict';

  /* All functions in this model are data-logic */

  /**
     * new Level(). Construct a new level object
     * @param {Number} width  Width in columns
     * @param {Number} height Height in rows
     * @param {Object} data   A one-dimensional array with the level data.
     *                        data: a 0 is clear, a 1 is a wall, 2 is death, 3 is start, 10 is an invisible used cell
     */
  var LevelModel = function LevelModel(width, height, data) {
    var i, j, diff;

    this.csize  = 15; // cell size
    this.width  = width;
    this.height = height;

    this.food = null;

    // clone instead of referencing
    this.wdata = new Array(width * height); // work data
    this.odata = new Array(width * height); // original data

    if(data.length > 0) {
      for(i = 0; i < data.length; i += 1) {
        this.wdata[i] = this.odata[i] = data[i];
      }

      diff = (data.length - (width * height));
      if(diff > 0) {
        j = data.length;
        for(i = 0; i < diff; i += 1) {
          this.wdata[i + j] = this.odata[i + j] = 0;
        }
      }
    } else {
      for(i = 0; i < (width * height); i += 1) {
        this.wdata[i] = this.odata[i] = 0;
      }
    }
  };

  /**
     * Restore the original level state
     */
  LevelModel.prototype.reset = function() {
    var i;
    for(i = 0; i < this.odata.length; i += 1) {
      this.wdata[i] = this.odata[i];
    }
  };

  /**
     * Get index from x and y coordinates in the level grid
     * @param   {Number} x x-coordinate
     * @param   {Number} y y-coordinate
     * @returns {Number} field index
     */
  LevelModel.prototype.index = function(x, y) {
    return ((y * this.width) + x);        
  };

  /**
     * Get field from wdata from x and y coordinates in the level grid
     * @param   {Number} x x-xoordinate
     * @param   {Number} y y-coordinate
     * @returns {Number} field content
     */
  LevelModel.prototype.getField = function(x, y) {
    return this.wdata[this.index(x, y)];
  };

  /**
     * Return a random empty cell from the model, data logic
     * @param   {Array}  positionList a list of objects containing x and y coordinates to also check against.
     * @returns {Object} Position2D object
     */
  LevelModel.prototype.emptyCell = function(positionList) {
    var attempt = 0, rx, ry, ri, i, found, hpl = typeof positionList === "object", result = null;

    while(attempt < this.wdata.length) {
      rx = Math.floor(Math.random() * this.width);
      ry = Math.floor(Math.random() * this.height);
      ri = this.index(rx, ry);

      found = false;

      if(hpl) {
        for(i = 0; i < positionList.length; i += 1) {
          if(positionList[i].x === rx && positionList[i].y === ry) {
            found = true;
            break; 
          }
        } 
      }


      if(!found && this.wdata[ri] === 0) {
        result = new Position2D(rx, ry);
        break;
      }

      attempt += 1;
    }

    return result;
  };

  root.LevelModel = LevelModel;
}(window));

(function(root) {
  'use strict';

  /**
     * Holds data about a message overlay.
     * @param {String} message1 Message line 1
     * @param {String} message2 Message line 2
     */
  var MessageModel = function MessageModel(message1, message2) {
    this.message1       = message1;
    this.message2       = message2 || "Press any key to restart.";
    this.color          = "#ffffff";
    this.overlay        = "rgba(0, 0, 0, 0.7)";
    this.shadowBlur     = 10;
    this.shadowColor    = "rgba(0, 0, 0, 0.9)";
    this.font           = window.FONTS.messages.toString();
  };

  root.MessageModel = MessageModel;
}(window));

(function(root) {
  'use strict';

  /**
     * Holds the coordinates to a 2D point
     * @param {Number} x x-coordinate
     * @param {Number} y y-coordinate
     */
  var Position2D = function Position2D(x, y) {
    this.x = x;
    this.y = y;
  };

  root.Position2D = Position2D;
}(window));

(function(root) {
  'use strict';

  /**
     * Holds 2D size
     * @param {Number} width  width in any unit
     * @param {Number} height height in any unit
     */
  var Size2D = function Size2D(width, height) {
    this.width  = width;
    this.height = height;
  };

  root.Size2D = Size2D;
}(window));

(function(root) {
  'use strict';

  // keys and directions
  root.KEY_UP    = root.DIR_UP    = 38;
  root.KEY_DOWN  = root.DIR_DOWN  = 40;
  root.KEY_LEFT  = root.DIR_LEFT  = 37;
  root.KEY_RIGHT = root.DIR_RIGHT = 39;
  root.DIR_INV   = {}; // inverse
  root.DIR_INV[root.DIR_UP]     = root.DIR_DOWN;
  root.DIR_INV[root.DIR_DOWN]   = root.DIR_UP;
  root.DIR_INV[root.DIR_RIGHT]  = root.DIR_LEFT;
  root.DIR_INV[root.DIR_LEFT]   = root.DIR_RIGHT;

  /**
     * Holds information about the whole snake, including a list of SnakeSegmentModels
     * @param {Position2D} position a Position2D instance
     */
  var SnakeModel = function SnakeModel(position) {
    if(!(position instanceof Position2D)) {
      throw new TypeError("Invalid Position2D Instance");
    }
    this.segments  = [new SnakeSegmentModel(position), new SnakeSegmentModel(new Position2D(position.x + 1, position.y))];
    this.direction = root.DIR_RIGHT;
    this.destroyed = false;
    this.cause     = '';
    this.sounds    = {};
    this.score     = 0;
    this.font      = window.FONTS.score;
    this.color     = "#ffffff";
  };

  root.SnakeModel = SnakeModel;
}(window));

(function(root) {
  'use strict';

  /**
     * Holds information about a single Snake segment / body part.
     * @param {Position2D} position a Position2D instance
     */
  var SnakeSegmentModel = function SnakeSegmentModel(position) {
    if(!(position instanceof Position2D)) {
      throw new TypeError("Invalid Position2D Instance");
    }

    this.x = position.x;
    this.y = position.y;
  };

  root.SnakeSegmentModel = SnakeSegmentModel;
}(window));

// data
(function(root) {
  'use strict';

  root.FONTS = {
    score: new Font("Press Start 2P", 10),
    messages: new Font("Press Start 2P", 14)
  };
}(window));


(function(root) {
  'use strict';

  root.LEVELS = [];

  function invisibleCell(level, x, y) {
    var index = level.index(x, y);
    level.wdata[index] = level.odata[index] = 10;
  }

  /**
     * Generate a level of specific dimensions, with a specific random obstacle round and the type of outer walls.
     * @param   {Number} width           width in cells
     * @param   {Number} height          height in rows
     * @param   {Number} randomWallCount # of random obstacle walls (could be diagonal, horizontal and vertical)
     * @param   {Number} outerWalls      render outer walls or not?
     * @returns {Object} returns a LevelModel
     */
  function generateLevel(width, height, randomWallCount, outerWalls) {
    var level = new LevelModel(width, height, []),
        rwc = (typeof randomWallCount === "number" ? randomWallCount : 4),
        x, y, i, rwx, rwy, rwl, rwdx, rwdy, ri, rc, hg, hr, vg, vr, 
        wallTypes = new Array(4),
        invisibleCells = [[0, 0], [width - 1, 0], [width - 1, height - 1], [0, height - 1]]; // corner cells.

    if(outerWalls) {
      for(i = 0; i < wallTypes.length; i += 1) {
        wallTypes[i] = 1 + Math.floor(Math.random() * 2);
      }

      hg = Math.floor(Math.random() * (width / 2));
      if(hg % 2 === 0) {
        hg -= 1;
      }
      hr = ((width - 2 - hg) / 2);

      vg = Math.floor(Math.random() * (height / 2));
      if(vg % 2 === 0) {
        vg -= 1;
      }
      vr = ((height - 2 - vg) / 2);

      for(x = 1; x < level.width - 1; x += 1) {
        if(x < vr || x > (level.width - vr - 1)) {
          i = level.index(x, 0);
          level.wdata[i] = level.odata[i] = wallTypes[0];
          i = level.index(x, level.height - 1);
          level.wdata[i] = level.odata[i] = wallTypes[1];  
        }
      }

      for(y = 1; y < level.height - 1; y += 1) {
        if(y < hr || y > (level.height - hr - 1)) {
          i = level.index(0, y);
          level.wdata[i] = level.odata[i] = wallTypes[2];

          i = level.index(level.width - 1, y);
          level.wdata[i] = level.odata[i] = wallTypes[3];  
        }
      }

      for(i = 0; i < invisibleCells.length; i += 1) {
        invisibleCell(level, invisibleCells[i][0], invisibleCells[i][1]);
      }
    }

    for(rc = 0; rc < rwc; rc += 1) {
      // calculate a position for a random wall, somewhere within the walls of the grid. 
      rwx  = Math.floor(3 + Math.random() * (level.width - 6));
      rwy  = Math.floor(3 + Math.random() * (level.height - 6));
      rwl  = Math.floor(3 + Math.random() * 5);
      rwdx = ((rwx < level.width / 2) ? 1 : -1);
      rwdy = ((rwy < level.height / 2) ? 1 : -1);

      for(ri = 0; ri < rwl; ri += 1) {
        i = level.index(rwx, rwy);

        // don't try to make a new block when one already exists! 
        if(level.wdata[i] !== 0) {
          break;
        }

        level.wdata[i] = level.odata[i] = 2;

        rwx += rwdx;
        rwy += rwdy;
      }
    }

    return level;
  }

  var levelWidth = 30, levelHeight = 30;

  window.LEVELS.push(generateLevel(levelWidth, levelHeight, 5, 1));
  window.LEVELS.push(generateLevel(levelWidth, levelHeight, 5, 2));
  window.LEVELS.push(generateLevel(levelWidth, levelHeight, 2, 2));
  window.LEVELS.push(generateLevel(levelWidth, levelHeight, 1, 2));

  root.generateLevel = generateLevel;
}(window));


(function(root) {
  'use strict';

  var rootPath = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/188512/",
      extension = "mp3";

  root.MUSIC_FILES = [
    rootPath + "music1." + extension,
    rootPath + "music2." + extension,
    rootPath + "music3." + extension,
    rootPath + "music4." + extension,
    rootPath + "music5." + extension
  ];
}(window));


(function(root) {
  'use strict';

  var rootPath = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/188512/",
      extension = "mp3";

  root.SOUND_FILES = {
    pickup: {src: rootPath + "pickup." + extension, volume: 1},
    death:  {src: rootPath + "death." + extension, volume: 1},
    thump:  {src: rootPath + "thump." + extension, volume: 0.3}
  };
}(window));

// libraries

(function(root) {
  'use strict';

  /**
     * A simple wrapper for Canvas
     * @param {String} elementId HTML Element ID
     */
  var Canvas = function Canvas(elementId) {
    this.element = document.getElementById(elementId);
    this.context = this.element.getContext('2d');
  };

  /**
     * Get the size of the canvas element.
     * @returns {Size2D} returns a Size2D model. 
     */
  Canvas.prototype.getSize = function() {
    return new Size2D(+this.element.width, +this.element.height);
  };

  /**
     * Set the size of the canvas element.
     * @param {Size2D} size a Size2D instance
     */
  Canvas.prototype.setSize = function(size) {
    if(!(size instanceof Size2D)) {
      throw new TypeError("Invalid Size2D instance");
    }

    this.element.width = this.context.canvas.width = size.width;
    this.element.height = this.context.canvas.height = size.height;
  };

  /**
     * Clear the canvas completely by either removing all color information from its buffer or
     * by drawing an overlay to create a fade effect. 
     * @param {Number} fadeOpacity the opacity for the fade layer. Leave empty for full clear.
     */
  Canvas.prototype.clear = function(fadeOpacity) {
    var size = this.getSize();
    if(typeof fadeOpacity === "number") {
      this.context.fillStyle = 'rgba(0, 0, 0, ' + fadeOpacity + ')';
      this.context.fillRect(0, 0, size.width, size.height);
    } else {
      this.context.clearRect(0, 0, size.width, size.height);
    }
  };

  root.Canvas = Canvas;
}(window));


(function(root) {
  'use strict';

  /**
     * A simple wrapper for short Audio playback, used to play 
     * FX sounds such as the sound played when you hit the wall.
     * @param {String} path   URL / relative path to sound file.
     * @param {Number} volume A volume level between 0 and 1, defaults to 1
     */
  var Sound = function Sound(path, volume) {
    var that = this;

    this.path         = path;
    this.audio        = new Audio();
    this.audio.src    = path;
    this.audio.loop   = false;
    this.audio.volume = volume || 1;
    this.ready        = false;

    this.audio.addEventListener('canplay', function() {
      that.ready = true;
    });
  };

  Sound.prototype.pause = function() {
    this.audio.pause();
  };

  Sound.prototype.stop = function() {
    if(this.ready) {
      this.audio.currentTime = 0;
      this.pause();
    }
  };

  Sound.prototype.play = function() {
    var that = this;
    if(this.audio.playing) {
      this.stop();
      this.audio.currentTime = 0;
    }
    this.audio.play();

  };

  root.Sound = Sound;
}(window));

// controllers

(function(root) {
  'use strict';

  /**
     * The KeyboardController class is used to monitor keypresses and make them accesible 
     * at all times, via the KeyboardModel. 
     * @param {KeyboardModel} model an instance of KeyboardModel, to store the data.
     */
  var KeyboardController = function KeyboardController(model) {
    if(!(model instanceof KeyboardModel)) {
      throw new TypeError("Invalid model instance");
    }

    this.model   = model;
    this.started = false;
    this.start();
  };

  /**
     * Attaches the event handlers to the window object.
     */
  KeyboardController.prototype.start = function() {
    if(this.started) {
      return true;
    }

    var that = this;
    window.addEventListener('keydown', function(event) {
      that.model.pressedKeys[event.keyCode || event.which] = true;

      that.model.modifiers.control = !!event.ctrlKey;
      that.model.modifiers.alt     = !!event.altKey;
      that.model.modifiers.shift   = !!event.shiftKey;

      event.preventDefault();
      return false;
    });

    window.addEventListener('keyup', function(event) {
      that.model.pressedKeys[event.keyCode || event.which] = false;

      that.model.modifiers.control = !!event.ctrlKey;
      that.model.modifiers.alt     = !!event.altKey;
      that.model.modifiers.shift   = !!event.shiftKey;

      event.preventDefault();
      return false;
    });

    window.addEventListener('keypress', function(event) {
      if(that.model.blockedKeys[event.keyCode || event.which]) {
        console.log("blocked");
        event.preventDefault();
        return false;
      }
    });

    this.started = true;
  };

  /**
     * Gets called from the main application gameloop.
     */
  KeyboardController.prototype.update = function() { 
    // nothing special is being updated through this controller
    return undefined;
  };

  /**
     * Determine if there is any key being pressed at this moment (support for "Press any key to...")
     * @returns {Boolean} when a key is currently down, returns true.
     */
  KeyboardController.prototype.hasAnyKeyDown = function() {
    var i;
    for(i in this.model.pressedKeys) {
      if(this.model.pressedKeys.hasOwnProperty(i)) {
        if(this.model.pressedKeys[i]) {
          return true;
        }
      }
    }

    return false;
  };

  /**
     * Can be used to determine if a key is currently being pressed or not.
     * @param   {Number}  keyCode the keycode to check for, e.g. 13 for return.
     * @returns {Boolean} true when the key is down, false if the key is up (or when it does not exist).
     */
  KeyboardController.prototype.isKeyDown = function(keyCode) {
    return !!this.model.pressedKeys[keyCode];
  };

  root.KeyboardController = KeyboardController;
}(window));


(function(root) {
  'use strict';

  // very simple controller to init food data when timed out on level update
  var LevelController = function LevelController(modLevel, modFood, modSnake) {
    if(!(modLevel instanceof LevelModel)) {
      throw new TypeError("Invalid LevelModel instance");
    }

    if(!(modFood instanceof FoodModel)) {
      throw new TypeError("Invalid FoodModel instance");
    }

    if(!(modSnake instanceof SnakeModel)) {
      throw new TypeError("Invalid SnakeModel instance");
    }

    this.modSnake      = modSnake;
    this.modLevel      = modLevel;
    this.modLevel.food = modFood;
  };

  LevelController.prototype.update = function() {
    if((Date.now() - this.modLevel.food.birth) >= this.modLevel.food.life) {
      this.modSnake.score -= 3;
      if(this.modSnake.score < 0) { 
        this.modSnake.score = 0;
      }

      this.modLevel.food.init(this.modLevel.emptyCell(), Math.floor(Math.random() * 3));
    }
  };

  root.LevelController = LevelController;
}(window));


(function(root) {
  'use strict';

  /**
     * One of the biggest controllers in the application, the one that controls the snake
     * and the snake food. 
     * @param {SnakeModel}         snakeModel         a SnakeModel instance
     * @param {LevelModel}         levelModel         a LevelModel instance
     * @param {KeyboardController} keyboardController a KeyboardController instance
     */
  var SnakeController = function SnakeController(snakeModel, levelModel, keyboardController) {
    var rec;

    if(!(snakeModel instanceof SnakeModel)) {
      throw new TypeError("Invalid SnakeModel instance.");
    }

    if(!(levelModel instanceof LevelModel)) {
      throw new TypeError("Invalid LevelModel instance.");
    }

    if(!(keyboardController instanceof KeyboardController)) {
      throw new TypeError("Invalid KeyboardController instance.");
    }

    this.modSnake    = snakeModel;
    this.modLevel    = levelModel;
    this.ctrKeyboard = keyboardController;
    this.timePrint   = Date.now();

    // find enough space in the level for our snake to start from, it needs at least 3 cells. 
    while(true) {
      rec = this.modLevel.emptyCell();
      if(this.modLevel.getField(rec.x + 1, rec.y) === 0 && this.modLevel.getField(rec.x + 2, rec.y) === 0) {
        this.modSnake.segments[0].x = rec.x;
        this.modSnake.segments[0].y = rec.y;
        this.modSnake.segments[1].x = rec.x + 1;
        this.modSnake.segments[1].y = rec.y;

        break; 
      }
    }

    // place some food
    this.newFood();
  };

  /**
     * Move the snake one step, in the set direction.
     * @returns {Boolean} returns true if the movement is hitting a cell but is harmless, 
     *                    false when snake dies and null if all is well.
     */
  SnakeController.prototype.move = function() {
    var nx = this.modSnake.segments[0].x, // head x
        ny = this.modSnake.segments[0].y, // head y
        nt, nf, i;

    // new position
    if(this.modSnake.direction === DIR_RIGHT) {
      nx += 1;
    } else if(this.modSnake.direction === DIR_LEFT) {
      nx -= 1;
    } else if(this.modSnake.direction === DIR_DOWN) {
      ny += 1;
    } else if(this.modSnake.direction === DIR_UP) {
      ny -= 1;
    }

    // wrap around the world, x-axis first
    if(nx >= this.modLevel.width) {
      nx = 0;
    } else if(nx < 0) {
      nx = (this.modLevel.width - 1);
    }

    // y-axis
    if(ny >= this.modLevel.height) {
      ny = 0;
    } else if(ny < 0) {
      ny = (this.modLevel.height - 1);
    }

    // try collision with level entities
    nf = this.modLevel.getField(nx, ny);
    switch(nf) {
      case 1: // cell type 1 is a green cell, just notify the player with a thump.
        this.modSnake.sounds.thump.play();
        return true;

      case 2: // cell type 2 is the deadly red kind, kill it! 
        this.modSnake.sounds.death.play();
        this.modSnake.destroyed = true;
        this.modSnake.cause = "wall";
        return false;
    }

    // try collision with snake segments
    for(i = 0; i < this.modSnake.segments.length - 1; i += 1) {
      if(this.modSnake.segments[i].x === nx && this.modSnake.segments[i].y === ny) {
        this.modSnake.sounds.death.play();
        this.modSnake.destroyed = true;
        this.modSnake.cause = "snake";
        return false;
      }
    }

    // collision with a piece of food? If so, add a new snake segment and piece of food.
    if(this.modLevel.food.position.x === nx && this.modLevel.food.position.y === ny) {
      nt = new Position2D(nx, ny);

      this.modSnake.sounds.pickup.play();
      if(!this.newFood()) {
        this.modSnake.sounds.death.play();
        this.modSnake.destroyed = true;
        this.modSnake.cause = "obesity";
      }
      this.modSnake.score += (this.modLevel.food.type + 1) * 2;
    } else {
      // nothing happened, pop a tail segment as the 'new' head element
      nt = this.modSnake.segments.pop();
      nt.x = nx; nt.y = ny;
    }

    // place the new element at the front of the array
    this.modSnake.segments.unshift(nt);
  };

  /**
     * Change the direction of the snake, by simply changing the head's direction.
     * @param {Number} direction a direction constant, such as DIR_UP, DIR_DOWN.
     */
  SnakeController.prototype.setDirection = function(direction) {
    if(this.modSnake.direction !== direction && DIR_INV[this.modSnake.direction] !== direction) {
      this.modSnake.direction = direction;
      this.move();
      this.timePrint = Date.now();
    }
  };

  /**
     * Update the Snake's position and direction, when required.
     */
  SnakeController.prototype.update = function() {
    if(this.ctrKeyboard.isKeyDown(KEY_UP)) {
      this.setDirection(DIR_UP);
    } else if(this.ctrKeyboard.isKeyDown(KEY_DOWN)) {
      this.setDirection(DIR_DOWN);
    } else if(this.ctrKeyboard.isKeyDown(KEY_LEFT)) {
      this.setDirection(DIR_LEFT);
    } else if(this.ctrKeyboard.isKeyDown(KEY_RIGHT)) {
      this.setDirection(DIR_RIGHT);
    }

    var now = Date.now(),
        dif = (now - this.timePrint);

    if(dif >= 200) {
      // actually move left, up, right or down.
      this.move();
      this.timePrint = now;
    }
  };

  /** 
     * Place new food in the level.
     * @returns {Boolean} true when new food could be placed and false when the player has finished playing. 
     */
  SnakeController.prototype.newFood = function() {
    var rpos = this.modLevel.emptyCell(this.modSnake.segments);
    if(rpos) {
      this.modLevel.food.init(rpos, Math.floor(Math.random() * 3));
      return true;
    }

    return false;
  };

  /**
     * Check if the Snake is dead!
     * @returns {Boolean} living state
     */
  SnakeController.prototype.isDestroyed = function() {
    return !!this.modSnake.destroyed;
  };

  root.SnakeController = SnakeController;
}(window));

// views

(function(root) {
  'use strict';

  /**
     * The view for the FoodModel, controlled by SnakeController
     * @param {FoodModel}  modFood  the FoodModel instance, containing the birth and lifetime
     * @param {LevelModel} modLevel a LevelModel instance, used for dimensions
     * @param {Object}     context  a 2D drawing context
     */
  var FoodTimerView = function FoodTimerView(modFood, modLevel, context) {
    if(!(modFood instanceof FoodModel)) {
      throw new TypeError("Invalid FoodModel instance");
    }

    if(!(modLevel instanceof LevelModel)) {
      throw new TypeError("Invalid LevelModel instance");
    }

    this.modFood  = modFood;
    this.modLevel = modLevel;
    this.context  = context;
  };

  /**
     * Called by the Application controller
     */
  FoodTimerView.prototype.render = function() {
    var timeDiff    = (Date.now() - this.modFood.birth),
        passedTime  = (timeDiff / this.modFood.life),
        sizeFactor  = 0.5,
        levelWidth  = (this.modLevel.width * this.modLevel.csize) + 1,
        levelHeight = (this.modLevel.height * this.modLevel.csize) + 33,
        barLimit    = (levelWidth * sizeFactor),
        barWidth    = barLimit - (levelWidth * (sizeFactor * passedTime)),
        barHeight   = 22,
        positionX   = (levelWidth - barLimit - 5) + 0.5,
        positionY   = (levelHeight - barHeight - 5) + 0.5;

    this.context.lineWidth = 1;
    this.context.strokeStyle = '#333333';
    this.context.strokeRect(positionX, positionY, barLimit, barHeight);

    this.context.beginPath();
    this.context.rect(positionX, positionY, barWidth, barHeight);
    this.context.fillStyle   = '#00be00';
    this.context.strokeStyle = '#cecece';
    this.context.fill();
    this.context.stroke();
    this.context.closePath();
  };

  root.FoodTimerView = FoodTimerView;
}(window));


(function(root) {
  'use strict';

  /**
     * The view for the whole LevelModel
     * @param {LevelModel} model   the LevelModel instance
     * @param {Object}     context a 2D drawing context
     */
  var LevelView = function LevelView(model, context) {
    this.context  = context;
    if(model instanceof LevelModel) {
      this.model = model;
    } else {
      throw new TypeError("Invalid model instance");
    }
  };

  /**
     * Called by the Application controller
     */
  LevelView.prototype.render = function() {
    var x, y, field, cx, cy, color, stroke;
    this.context.fillStyle = "#000000";
    this.context.lineWidth = 1;
    this.context.lineCap = "square";
    this.context.fillRect(0, 0, this.model.width * this.model.csize, this.model.height * this.model.csize);

    // grid
    for(x = 0; x < this.model.width; x += 1) {
      for(y = 0; y < this.model.height; y += 1) {
        cx = (x * this.model.csize) + 0.5;
        cy = (y * this.model.csize) + 0.5;

        this.context.strokeStyle = "#111111";
        this.context.beginPath();
        this.context.rect(cx, cy, this.model.csize, this.model.csize);
        this.context.stroke();
        this.context.closePath();
      }
    }

    // obstacles
    for(x = 0; x < this.model.width; x += 1) {
      for(y = 0; y < this.model.height; y += 1) {
        field = this.model.getField(x, y);
        cx = (x * this.model.csize) + 0.5;
        cy = (y * this.model.csize) + 0.5;

        color = null;
        switch(field) {
          case 1: 
            color = "#003300";
            stroke = "#00ff00";
            break;

          case 2: 
            color = "#330000";
            stroke = "#ff0000";
            break;
        }

        if(color) {
          this.context.strokeStyle = stroke;
          this.context.fillStyle = color;
          this.context.beginPath();
          this.context.rect(cx, cy, this.model.csize, this.model.csize);
          this.context.fill();
          this.context.stroke();
          this.context.closePath();
        }
      }
    }

    // food
    cx = (this.model.food.position.x * this.model.csize) + 0.5;
    cy = (this.model.food.position.y * this.model.csize) + 0.5;

    switch(this.model.food.type) {
      case 0: 
        this.context.fillStyle = "#00ff00";
        break;

      case 1: 
        this.context.fillStyle = "#ffff00";
        break;

      case 2: 
        this.context.fillStyle = "#00ffff";
        break;
    }
    this.context.fillRect(cx, cy, this.model.csize, this.model.csize);
  };

  root.LevelView = LevelView;
}(window));


(function(root) {
  'use strict';

  /**
     * The view for a MessageModel
     * @param {MessageModel} messageModel a MessageModel instance
     * @param {LevelModel}   levelModel   a LevelModel instance, used for dimensions
     * @param {Object}       context      a 2D drawing context
     */
  var MessageView = function MessageView(messageModel, levelModel, context) {
    if(!(messageModel instanceof MessageModel)) {
      throw new TypeError("Invalid MessageModel instance");
    }

    if(!(levelModel instanceof LevelModel)) {
      throw new TypeError("Invalid LevelModel instance");
    }

    this.context  = context;
    this.modMsg   = messageModel;
    this.modLevel = levelModel;
  };

  /**
     * Called by the Application controller
     */
  MessageView.prototype.render = function() {
    var w = (this.modLevel.width * this.modLevel.csize) + 1,
        h = (this.modLevel.height * this.modLevel.csize) + 33,
        cx = w / 2, 
        cy = h / 2;

    this.context.save();
    this.context.fillStyle = this.modMsg.overlay;
    this.context.fillRect(0, 0, w, h);
    this.context.shadowBlur   = this.modMsg.shadowBlur;
    this.context.shadowColor  = this.modMsg.shadowColor;
    this.context.font         = this.modMsg.font;
    this.context.fillStyle    = this.modMsg.color;    
    this.context.textAlign    = "center";
    this.context.textBaseline = "bottom";
    this.context.fillText(this.modMsg.message1, cx, cy);
    this.context.textBaseline = "top";
    this.context.fillText(this.modMsg.message2, cx, cy);
    this.context.restore();
  };

  root.MessageView = MessageView;
}(window));


(function(root) {
  'use strict';

  /**
     * The view for the score, stored in SnakeModel
     * @param {SnakeModel} modSnake a SnakeModel instance
     * @param {LevelModel} modLevel a LevelModel instance
     * @param {Object}     context  a 2D drawing context
     */
  var ScoreView = function ScoreView(modSnake, modLevel, context) {
    if(!(modSnake instanceof SnakeModel)) {
      throw new TypeError("Invalid SnakeModel instance");
    }

    if(!(modLevel instanceof LevelModel)) {
      throw new TypeError("Invalid LevelModel instance");
    }

    this.context  = context;
    this.modSnake = modSnake;
    this.modLevel = modLevel;
  };

  /**
     * Called by the Application controller
     */
  ScoreView.prototype.render = function() {
    var h = (this.modLevel.height * this.modLevel.csize) + 33,
        cx = 5, 
        cy = (h - this.modSnake.font.size - this.modSnake.font.size / 2);

    this.context.font         = this.modSnake.font.toString();
    this.context.fillStyle    = this.modSnake.color;    
    this.context.textAlign    = "left";
    this.context.textBaseline = "middle";
    this.context.fillText("Score: " + this.modSnake.score, cx, cy);
  };

  root.ScoreView = ScoreView;
}(window));


(function(root) {
  'use strict';

  /**
     * The view for the whole SnakeModel and SnakeSegmentModels contained by it
     * @param {SnakeModel} modSnake a SnakeModel instance
     * @param {LevelModel} modLevel a LevelModel instance
     * @param {Object}     context  a 2D drawing context
     */
  var SnakeView = function SnakeView(modSnake, modLevel, context) {
    if(!(modSnake instanceof SnakeModel)) {
      throw new TypeError("Invalid SnakeModel instance");
    }

    if(!(modLevel instanceof LevelModel)) {
      throw new TypeError("Invalid LevelModel instance");
    }

    this.context  = context;
    this.modSnake = modSnake;
    this.modLevel = modLevel;
  };

  /**
     * Called by the Application controller
     */
  SnakeView.prototype.render = function() {
    var i, x, y/*, h*/;

    this.context.fillStyle = "#003300";
    this.context.strokeStyle = "#009900";
    for(i = 0; i < this.modSnake.segments.length; i += 1) {
      x = 0.5 + this.modSnake.segments[i].x * this.modLevel.csize;
      y = 0.5 + this.modSnake.segments[i].y * this.modLevel.csize;

      /*
                h = ((i / this.modSnake.segments.length) * 360);
                this.context.fillStyle = 'hsl(' + h + ', 100%, 50%)';
                this.context.strokeStyle = 'hsl(' + h + ', 100%, 70%)';
            */

      this.context.beginPath();
      this.context.rect(x, y, this.modLevel.csize, this.modLevel.csize);
      this.context.fill();
      this.context.stroke();
      this.context.closePath();
    }
  };

  root.SnakeView = SnakeView;
}(window));

// Application controller and gamestate

(function(root) {
  'use strict';

  /**
     * The main controller for this application.
     * A.K.A. The Game State Controller! :) 
     */
  var Application = function Application() {
    var i, 
        canvas  = new Canvas("render-target"),
        modKeyboard = new KeyboardModel(),
        ctrKeyboard = new KeyboardController(modKeyboard);

    this.modKeyboard = modKeyboard;
    this.ctrKeyboard = ctrKeyboard;

    // cancel regular behaviour
    modKeyboard.blockedKeys[KEY_DOWN]  = true;
    modKeyboard.blockedKeys[KEY_UP]    = true;
    modKeyboard.blockedKeys[KEY_RIGHT] = true;
    modKeyboard.blockedKeys[KEY_LEFT]  = true;

    // keep track of framerate by using Stats.js
    this.stats = new Stats();
    this.stats.setMode(0); // mode 0 is FPS, mode 1 is milliseconds per frame.

    // align top-left
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left     = '5px';
    this.stats.domElement.style.top      = '5px';

    // append stats element to the body
    document.body.appendChild(this.stats.domElement);

    // this will be our render target
    this.renderTarget = canvas;

    // configure all the sounds, these sounds will be played on certain events.
    this.sounds = {};
    for(i in SOUND_FILES) {
      if(SOUND_FILES.hasOwnProperty(i)) {
        this.sounds[i] = new Sound(SOUND_FILES[i].src, SOUND_FILES[i].volume);
      }
    }

    // initialize the remaining models and start the gameloop.
    this.init();
  };

  Application.prototype.init = function() {
    var i, 
        that = this,

        // create the snake model, the controller will position it later. Level needs this!
        modSnake = new SnakeModel(new Position2D(0, 0)), 


        modLevel = generateLevel(30, 30, 3 + Math.floor(Math.random() * 5), true),
        modFood  = new FoodModel(), // generate empty food model
        ctrLevel = new LevelController(modLevel, modFood, modSnake), // create the level controller based on two models
        disLevel = new LevelView(modLevel, this.renderTarget.context), // create the level view, based on a model and a drawing context

        ctrSnake = new SnakeController(modSnake, modLevel, this.ctrKeyboard), // create snake ccontroller based on snake model, level model and keyboard controller
        disSnake = new SnakeView(modSnake, modLevel, this.renderTarget.context), // create the snake view, based on the snake model, level model and drawing context

        // simple score view
        disScore = new ScoreView(modSnake, modLevel, this.renderTarget.context),

        // and a simple food timer view
        disFoodTimer = new FoodTimerView(modFood, modLevel, this.renderTarget.context);

    this.modLevel    = modLevel;
    this.controllers = [];
    this.models      = [];
    this.views       = [];
    this.waitKey     = false;
    this.paused      = false;
    this.cancel      = false;
    this.starting    = true;

    // stop all sounds and make sure the snake model knows about them
    modSnake.sounds = this.sounds;
    for(i in this.sounds) {
      if(this.sounds.hasOwnProperty(i)) {
        this.sounds[i].stop();
      }
    }

    // some message models and views
    this.winOrDieMessage     = new MessageModel("YOU DIED");
    this.winOrDieMessageView = new MessageView(this.winOrDieMessage, modLevel, this.renderTarget.context);
    this.pausedMessage       = new MessageModel("Start Game.", "Press any key to start.");
    this.pausedMessageView   = new MessageView(this.pausedMessage, modLevel, this.renderTarget.context);

    // if a track is playing, stop it.
    if(this.modAudio) {
      this.modAudio.pause();
    }

    // load the game music and start playing when it can be played.
    this.modAudio = new Audio();
    this.modAudio.src = MUSIC_FILES[Math.floor(Math.random() * MUSIC_FILES.length)];
    this.modAudio.loop = true;
    this.modAudio.volume = 0.4;
    this.modAudio.addEventListener('canplay', function() {
      this.play();
    });

    // push all models, views and controllers to the main controller. 
    this.pushAll(this.modKeyboard, undefined, this.ctrKeyboard);
    this.pushAll(modLevel, disLevel, ctrLevel);
    this.pushAll(modSnake, disSnake, ctrSnake);
    this.views.push(disScore);
    this.views.push(disFoodTimer);

    // resize the canvas to be able to fit the grid!
    this.renderTarget.setSize(new Size2D(modLevel.csize * modLevel.width + 1, modLevel.csize * modLevel.height + 33));

    // signal the gameloop to stop
    this.endLoop();

    // wait for a little over 1 frame at 60 FPS before we start the loop 
    setTimeout(function() {
      that.beginLoop();
    }, 20);
  };

  /**
     * Push all the MVC components at once, if required.
     * @param {Object} model      a model / data representation
     * @param {Object} view       a view / output of a model
     * @param {Object} controller the controller
     */
  Application.prototype.pushAll = function(model, view, controller) {
    if(typeof model === "object") {
      this.models.push(model);
    }

    if(typeof view  === "object") {
      this.views.push(view);
    }

    if(typeof controller === "object") {
      this.controllers.push(controller);
    }
  };

  /**
     * Start the gameloop.
     */
  Application.prototype.beginLoop = function() {
    var that = this, time;

    this.cancel = false;
    this.renderTarget.clear(1);
    (function gameLoop() {
      var i;

      // begin tracking
      that.stats.begin();

      if(!that.waitKey && !that.paused) {
        // if the game just started, pause it to prevent instant death because the player is not paying attention...
        if(that.starting) {
          that.starting = false;
          that.paused = that.waitKey = true;
          time = Date.now();
        }
        // update all the controllers before rendering anything.
        for(i in that.controllers) {
          if(that.controllers.hasOwnProperty(i)) {
            that.controllers[i].update();

            // if the controller is a snake, check if it is destroyed yet...
            if(that.controllers[i] instanceof SnakeController) {
              if(that.controllers[i].isDestroyed()) {
                if(that.controllers[i].modSnake.cause === "obesity") {
                  that.winOrDieMessage.message1 = "YOU WIN, BUT YOU STILL DIED FATTY!";
                } else {
                  that.winOrDieMessage.message1 = "YOU DIED, you got owned by " + (that.controllers[i].modSnake.cause === "snake" ? "eating yourself" : "a wall") + "!";
                }
                that.waitKey = true;
                that.modAudio.pause();
                time = Date.now();
              }
            }
          }
        }

        // if the loop shouldn't wait for a key, and P was pressed, pause the game.
        if(!that.waitKey && that.ctrKeyboard.isKeyDown(80)) {
          that.paused = that.waitKey = true;
          that.modAudio.pause();
          time = Date.now();

          that.pausedMessage.message1 = "Paused.";
          that.pausedMessage.message2 = "Press any key to continue.";

          that.modLevel.food.age = (Date.now() - that.modLevel.food.birth);
        }

        // clear the rendering target
        that.renderTarget.clear(0.5);

        // render all the views.
        for(i in that.views) {
          if(that.views.hasOwnProperty(i)) {
            that.views[i].render();
          }
        }

        // if we need to wait for a key, we first need to render the notification that tells the player to press one. 
        if(that.waitKey) {
          if(that.paused) {
            that.pausedMessageView.render();
          } else {
            that.winOrDieMessageView.render();
          }
        }
      } else {
        // wait for any keypress, debounce at 500ms 
        if(that.ctrKeyboard.hasAnyKeyDown() && Date.now() - time > 500) {
          if(that.paused) {
            // resume game logic
            that.paused = that.waitKey = false;
            that.modAudio.play();

            // debounce all keys.
            that.ctrKeyboard.model.pressedKeys = {};

            // restore the food age
            that.modLevel.food.birth = (Date.now() - that.modLevel.food.age);
          } else {
            // restart game, player died and pressed a key
            that.init();
          }
        }
      }

      // stop tracking and display FPS. 
      that.stats.end();

      // request the next frame 
      if(!that.cancel) {
        // request the next animation frame 
        that.frame = requestAnimationFrame(gameLoop);
      }
    }());
  };

  /**
     * End the gameloop
     */
  Application.prototype.endLoop = function() {
    this.cancel = true;
  };

  // export module 
  root.Application = Application;
}(window));

(function(root) {
  'use strict';

  // main.js just fires up the application
  window.addEventListener('load', function() {
    root.ctrApplication = new Application();
  });
}(window));

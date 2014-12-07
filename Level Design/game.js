//Settings.
var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    tileWidth = 32,
    tileHeight = 18,
    tileSize = 16,
    tileAmount = tileWidth * tileHeight,
    width = tileWidth * tileSize,
    height = tileHeight * tileSize,
    fps = 60,
    minFps = 4;

//Engine variables. Time is handled in milliseconds.
var requestAnimationFrame = window.requestAnimationFrame
                            || window.mozRequestAnimationFrame
                            || window.webkitRequestAnimationFrame
                            || window.msRequestAnimationFrame,
    body = document.getElementsByTagName('body')[0],
    keys = {},
    key = {
        '%': 0, //Left arrow.
        '&': 0, //Up arrow.
        "'": 0, //Right arrow.
        '(': 0, //Down arrow.
        'R': 0
    },
    currentKey = 'R',
    releasedKeys = [],
    mouse = {},
    click = null,
    time = 0, //Time elapsed in in-game milliseconds.
    currentTime = 0,
    lastTime = 0,
    frameTime = 0,
    accumulator = 0, //Time storage.
    maxDuration = 1000 / minFps, //Worst frame duration accepted. If reached, prevent the game from freezing but causes unreliable updates.
    minDuration = 1000 / fps; //Optimal frame duration.

canvas.width = width;
canvas.height = height;

//Input management.
body.addEventListener('keydown', function(event) {
    keys[String.fromCharCode(event.which)] = true;
}, false);

body.addEventListener('keyup', function(event) {
    keys[String.fromCharCode(event.which)] = false;
    releasedKeys.push(String.fromCharCode(event.which));
}, false);

canvas.addEventListener('mousemove', function(event) {
    mouse = {'x': event.offsetX, 'y': event.offsetY};
}, false);

canvas.addEventListener('click', function(event) {
    click = {'x': event.offsetX, 'y': event.offsetY};
}, false);

//Main game loop.
function onEnterFrame() {
    currentTime = new Date().getTime();
    frameTime = currentTime - lastTime;
    lastTime = currentTime;

    //Check if the game updates too slowly to avoid a vicious circle.
    if(frameTime > maxDuration) {
        frameTime = maxDuration;
    }

    accumulator += frameTime;

    //Update the game with all the time we got.
    while(accumulator >= minDuration) {
        update(minDuration); //Simulate minDuration milliseconds.
        click = null; //Reset the mouse input.
        time += minDuration;
        accumulator -= minDuration;
    }

    render();

    requestAnimationFrame(onEnterFrame);
}

//Return an initialized array with a given size and fill it with a specified value.
function initArray(size, value) {
    var k,
        array = new Array(size);

    for(k = 0; k < size; k++) {
        array[k] = value;
    }

    return array;
}

/**
 * Draws a rounded rectangle using the current state of the canvas. 
 * @param x - Number - The top left x coordinate.
 * @param y - Number - The top left y coordinate.
 * @param width - Number - The width of the rectangle.
 * @param height - Number - The height of the rectangle.
 * @param radius - Number - The corner radius.
 * @param fill - [Boolean] - Whether to fill the rectangle. Defaults to false.
 * @param stroke - [Boolean] - Whether to stroke the rectangle. Defaults to true.
 */
function roundRect(x, y, width, height, radius, fill, stroke) {
    if(typeof fill === "undefined") {
        fill = false;
    }
    if(typeof stroke == "undefined" ) {
        stroke = true;
    }

    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();

    if(stroke) {
        context.stroke();
    }
    if(fill) {
        context.fill();
    }        
}

/* ------------------------------------------------------------------------ */

//Game-related declarations.
var x = 0,
    y = 0,
    currentLevel = 0,
   tileMap1 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                   1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                   1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                   1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                   1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                   1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                   1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                   1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                   1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                   1, 0, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                   1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                   1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                   1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                   1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                   1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                   1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                   1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                   1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
                  ],
      patternMap1 = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', 'gggddd', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', 'hhbb', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
                       ],
 tileMap2 =    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 
                  1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 
                  1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 
                  1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 
                  1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 4, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 
                  1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 
                  1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 
                  1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 
                  1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				  
	patternMap2 = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', 'bbhdddgggh', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ddddddbbbbbbgggggghhhhhh', 'dddddbbbbbbgggggghhhhhhd', 'ddddbbbbbbgggggghhhhhhdd', 'dddbbbbbbgggggghhhhhhddd', 'ddbbbbbbgggggghhhhhhdddd', 'dbbbbbbgggggghhhhhhddddd',  'bbbbbbgggggghhhhhhdddddd', '', '', '', '', '',
                  '', 'bbhhdddggg', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hddddddbbbbbbgggggghhhhh', '', '', '', '', '', 'bbbbbgggggghhhhhhddddddb','', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhddddddbbbbbbgggggghhhh', '', '', '', '', '', 'bbbbgggggghhhhhhddddddbb','', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhhddddddbbbbbbgggggghhh', '', '', '', '', '', 'bbbgggggghhhhhhddddddbbb','', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhhhddddddbbbbbbgggggghh', '', '', '', '', '', 'bbgggggghhhhhhddddddbbbb','', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhhhhddddddbbbbbbggggggh', '', '', '', '', '', 'bgggggghhhhhhddddddbbbbb','', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhhhhhddddddbbbbbbgggggg', 'ghhhhhhddddddbbbbbbggggg', 'gghhhhhhddddddbbbbbbgggg', 'ggghhhhhhddddddbbbbbbggg', 'gggghhhhhhddddddbbbbbbgg', 'ggggghhhhhhddddddbbbbbbg', 'gggggghhhhhhddddddbbbbbb', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', 'hbbbhh', '', 'bbb--hhh', 'gbb--hhd', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',  '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'bh', '', 'bh', '', 'bh', '', 'bh', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',  'hb', '', 'hb', '', 'hb', '', 'hb', '', '', '','',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'bh', '', 'bh', '', 'bh', '', 'bh', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', 'hbbh', '', 'bhhb', '', 'hbbh', '', 'bhhb', '', '', '', 'hb', '', 'hb', '', 'hb', '', 'hb', '', '', '', '',
                  '', '', '', '', 'ggdddg', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                 ],		
					   
    tileMap3 =    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                  1, 1, 0, 1, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 4, 0, 1, 
                  1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 
                  1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 
                  1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 
                  1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 
                  1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 
                  1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 
                  1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 
                  1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 3, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 
                  1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 
                  1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 
                  1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 
                  1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 1, 1, 1, 0, 1, 0, 1, 
                  1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 
                  1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 
                  1, 1, 0, 1, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],

    patternMap3 = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', 'bh', '', 'bh', '', 'bh', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', 'hb', '', 'hb', '', 'hb', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ddddddbbbbbbgggggghhhhhh', 'dddddbbbbbbgggggghhhhhhd', 'ddddbbbbbbgggggghhhhhhdd', 'dddbbbbbbgggggghhhhhhddd', 'ddbbbbbbgggggghhhhhhdddd', 'dbbbbbbgggggghhhhhhddddd',  'bbbbbbgggggghhhhhhdddddd', '', '', '', '', '',
                  '', 'bh', '', 'bh', '', 'bh', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hddddddbbbbbbgggggghhhhh', '', '', '', '', '', 'bbbbbgggggghhhhhhddddddb','', '', '', '', '',
                  '', '', 'hb', '', 'hb', '', 'hb', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhddddddbbbbbbgggggghhhh', '', '', '', '', '', 'bbbbgggggghhhhhhddddddbb','', '', '', '', '',
                  '', 'bh', '', 'bh', '', 'bh', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhhddddddbbbbbbgggggghhh', '', '', '', '', '', 'bbbgggggghhhhhhddddddbbb','', '', '', '', '',
                  '', '', 'hb', '', 'hb', '', 'hb', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhhhddddddbbbbbbgggggghh', '', '', '', '', '', 'bbgggggghhhhhhddddddbbbb','', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhhhhddddddbbbbbbggggggh', '', '', '', '', '', 'bgggggghhhhhhddddddbbbbb','', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhhhhhddddddbbbbbbgggggg', 'ghhhhhhddddddbbbbbbggggg', 'gghhhhhhddddddbbbbbbgggg', 'ggghhhhhhddddddbbbbbbggg', 'gggghhhhhhddddddbbbbbbgg', 'ggggghhhhhhddddddbbbbbbg', 'gggggghhhhhhddddddbbbbbb', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', 'hbbbhh', '', 'bbb--hhh', 'gbb--hhd', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',  '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', 'bh', '', 'bh', '', 'bh', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', 'hb', '', 'hb', '', 'hb', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'bh', '', 'bh', '', 'bh', '', 'bh', '', '', '', '', '',
                  '', '', 'bh', '', 'bh', '', 'bh', '', '', '', '', '', '', '', '', '', '', '', '', '', '',  'hb', '', 'hb', '', 'hb', '', 'hb', '', '', '','',
                  '', 'hb', '', 'hb', '', 'hb', '', '', '', 'bhhb', '', 'hbbh', '', 'bhhb', '', 'hbbh', '', 'bhhb', '', '', 'bh', '', 'bh', '', 'bh', '', 'bh', '', '', '', '', '',
                  '', '', 'bh', '', 'bh', '', 'bh', '', '', 'bhhb', '', 'hbbh', '', 'bhhb', '', 'hbbh', '', 'bhhb', '', '', '', 'hb', '', 'hb', '', 'hb', '', 'hb', '', '', '', '',
                  '', 'hb', '', 'hb', '', 'hb', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                 ],

   	  

   tileMap4 =    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                  1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 1, 0, 1, 1, 
                  1, 2, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 
                  1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 
                  1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 
                  1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 4, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 
                  1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
                  ],

				 
                 
      patternMap4 = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'bbbbbghhhhhhd', 'dbbbbbghhhhhh', 'dbbbbbghhhhhh',
                        '', '', '', 'hbbh', 'hbbh', '', 'bhhb', '', 'hbbh', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'bbbbghhhhhhdb', 'hdbbbbbghhhhh',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'bbbghhhhhhdbb', 'hhdbbbbbghhhh',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'bbghhhhhhdbbb', 'hhhdbbbbbghhh',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'bghhhhhhdbbbb', 'hhhhdbbbbbghh',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ghhhhhhdbbbbb', 'hhhhhdbbbbbgh',
                        '', 'bbdddddhhggggg', 'gbbdddddhhgggg', 'ggbbdddddhhggg', 'gggbbdddddhhgg', 'ggggbbdddddhhg', 'gggggbbdddddhh', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhhhhhdbbbbbg', 'hhhhhhdbbbbbg',
                        '', 'bdddddhhgggggb', '', '', '', '', 'hgggggbbdddddh', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', 'dddddhhgggggbb', 'ddddhhgggggbbd', 'dddhhgggggbbdd', 'ddhhgggggbbddd', 'dhhgggggbbdddd', 'hhgggggbbddddd', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', 'dddddbbggggghh', 'ddddbbggggghhd', 'dddbbggggghhdd', 'ddbbggggghhddd', 'dbbggggghhdddd', 'bbggggghhddddd', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', 'hdddddbbgggggh', '', '', '', '', 'bggggghhdddddb', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', 'hhdddddbbggggg', 'ghhdddddbbgggg', 'gghhdddddbbggg', 'ggghhdddddbbgg', 'gggghhdddddbbg', 'ggggghhdddddbb', 'gd--', 'bbhh', '', '', '', '', '', '', '', '', '', '', '', '', 'gddg', '', '', '', '', '', 'gddg', '', '', '', '',
                        '', 'bbdddddhhggggg', 'gbbdddddhhgggg', 'ggbbdddddhhggg', 'gggbbdddddhhgg', 'ggggbbdddddhhg', 'gggggbbdddddhh', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'bh', '', 'hb', '', 'hb', '', 'bh', '', '', '', '',
                        '', 'bdddddhhgggggb', '', '', '', '', 'hgggggbbdddddh', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'gddg', '', 'gddg', '', '', '', '', '', '', '', '',
                        '', 'dddddhhgggggbb', 'ddddhhgggggbbd', 'dddhhgggggbbdd', 'ddhhgggggbbddd', 'dhhgggggbbdddd', 'hhgggggbbddddd', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'dg', '', 'dg', '', 'dg', '', 'dg', '', '', 'gd', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
                       ],
				 
   tileMap5 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
               1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1,
               1, 4, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1,
               1, 1, 0, 2, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 2, 1,
               1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1,
               1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1,
               1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
               1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1,
               1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1,
               1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 2, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1,
               1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 2, 0, 0, 1, 0, 1,
               1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
               1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
               1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1,
               1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1,
               1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1,
               1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 1, 3, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1,
               1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
              ],
    patternMap5 = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', 'dddggg', 'dddggg', '', '', '', '', '', 'bbhh', '', 'bbhh', '', '', '', '', 'bh', '', 'bh', '', 'bh', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', 'bbhh', '', 'bbhh', '', '', '', 'hb', '', 'hb', '', 'hb', '', 'hb', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', 'hhbb', '', 'hhbb', '', 'hhbb', '', '', '', 'bh', '', 'bh', '', 'bh', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', 'hhbb', '', 'hhbb', '', 'hhbb', '', '', 'hb', '', 'hb', '', 'hb', '', 'hb', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'bh', '', 'bh', '', 'bh', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hb', '', 'hb', '', 'hb', '', 'hb', '', '-d-d-d-b-b-g-g-g-h-h', '', '-d-b-b-g-g-g-h-h-d-d', 'b-b-g-g-g-h-h-d-d-d-', '', '', '', '',
                  '', '', '', '', 'bh', '', 'bh', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '-h-d-d-d-b-b-g-g-g-h', '', '', '', '', '', '', '',
                  '', '', 'dg', '', 'dg', '', 'bh', '', '', '', '', '', '', '', '', '', '', '', '', 'bh', '', 'bh', '', '', '-h-h-d-d-d-b-b-g-g-g', '', 'g-g-h-h-d-d-d-b-b-g-', '-g-g-g-h-h-d-d-d-b-b', '', '', '', '',
                  '', 'hb', 'gd--', '', '', '-dg-', '', '', '', '', '', '', '', '', '', '', '', '', 'hb', '', 'hb', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', 'gd', '', 'gd', '', 'gd', '', '', '', '', '', '', 'hhbbdg', '', '', '', '', '', 'bh', '', 'bh', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hb', '', 'hb', '', '', '', '', '', '', '', '', '', '', '',
                  '', 'bbddddddhhgggggg', 'gbbddddddhhggggg', '', 'gggbbddddddhhggg', 'ggggbbddddddhhgg', 'gggggbbddddddhhg', 'ggggggbbddddddhh', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', 'bddddddhhggggggb', '', '', '', '', '', '', '', 'hhbbbh', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', 'ddddddhhggggggbb', 'dddddhhggggggbbd', '', 'dddhhggggggbbddd', 'ddhhggggggbbdddd', 'dhhggggggbbddddd', 'hhggggggbbdddddd', '', '', '', 'hhbbbbhh', '', '', '', '', '', '', '', '', '', '', '', 'hhbbbh', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'gddg', '', '', '', '', '', '', '', '', '', 'gdddgg', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                 ],
    tileLevels = [
        tileMap1,
        tileMap2,
        tileMap3,
        tileMap4,
        tileMap5
    ],
    patternLevels = [
        patternMap1,
        patternMap2,
        patternMap3,
        patternMap4,
        patternMap5],
    errorX = null,
    errorY = null,
    checkpointX = x,
    checkpointY = y,
    currentMap = tileLevels[currentLevel].slice(0),
    currentPattern = patternLevels[currentLevel].slice(0),
    checkpointTileMap = tileLevels[currentLevel].slice(0),
    checkpointPatternMap = patternLevels[currentLevel].slice(0),
    levelChange = false,
    levelChangeTime = 0,
    levelChangeCounter = 0,
    levelChangeMap,
    time = 0,
    counter = 0;

function update(timeElapsed) {
    //Update inputs.
    for each(keyName in key) {
        if(keys[keyName]) {
            key[keyName] += timeElapsed;
        } else {
            key[keyName] = 0;
        }
    }

    if(!levelChange) {
        //Process inputs.
        var dx = 0,
            dy = 0;

        /*if(releasedKeys[0] === 'R') {
            x = checkpointX;
            y = checkpointY;
            currentMap = checkpointTileMap.slice(0);
            currentPattern = checkpointPatternMap.slice(0);
        } else if(releasedKeys[0] === '&') { //Up arrow.
            dy = -1;
        } else if(releasedKeys[0] === '(') { //Down arrow.
            dy = 1;
        } else if(releasedKeys[0] === '%') { //Left arrow.
            dx = -1;
        } else if(releasedKeys[0] === "'") { //Right arrow.
            dx = 1;
        }*/

        if(key['R'] > 0) {
            x = checkpointX;
            y = checkpointY;
            currentMap = checkpointTileMap.slice(0);
            currentPattern = checkpointPatternMap.slice(0);
        } else {

        }

        //If the player wants to move, calculate the new map.
        if(dx !== 0  || dy !== 0) {
            var i, j, index, pattern, movement,
                newTileMap = initArray(tileAmount, 0),
                newPatternMap = initArray(tileAmount, '');

            //Process labyrinth movements.
            for(j = 0; j < tileHeight; j++) { //Loop though the height.
                for(i = 0; i < tileWidth; i++) { //Loop though the width.
                    index = i + j * tileWidth;
                    pattern = currentPattern[index];
                    movement = pattern[0];
                    pattern = pattern.slice(1, pattern.length);

                    if(pattern === '') { //In this case, the tile doesn't move.
                        if(currentMap[index] !== 0) { //Write in the newTileMap array only if it is not a floor tile.
                            newTileMap[index] = currentMap[index];
                        }
                    } else {
                        switch(movement) { //Execute the first movement of the sequence.
                            case 'h': //One tile up.
                                newTileMap[index - tileWidth] = currentMap[index];
                                newPatternMap[index - tileWidth] = pattern + movement;
                                break;
                            case 'b': //One tile down.
                                newTileMap[index + tileWidth] = currentMap[index];
                                newPatternMap[index + tileWidth] = pattern + movement;
                                break;
                            case 'g': //One tile left.
                                newTileMap[index - 1] = currentMap[index];
                                newPatternMap[index - 1] = pattern + movement;
                                break;
                            case 'd': //One tile right.
                                newTileMap[index + 1] = currentMap[index];
                                newPatternMap[index + 1] = pattern + movement;
                                break;
                            case '-': //Stay in position.
                                newTileMap[index] = currentMap[index];
                                newPatternMap[index] = pattern + movement;
                                break;
                        }
                    }
                }
            }

            //Check Collisions. Only move if the player goes to a floor tile.
            if(newTileMap[x + dx + tileWidth * (y + dy)] !== 1) {
                currentMap = newTileMap;
                currentPattern = newPatternMap;

                x = x + dx;
                y = y + dy;

                errorX = null;
                errorY = null;

                //If a checkpoint is reached.
                if(currentMap[x + tileWidth * y] === 2 || currentMap[x + tileWidth * y] === 3) { //Blue or Red checkpoint.
                    //Remove the old one.
                    currentMap[checkpointX + tileWidth * checkpointY] = 0;

                    //If the checkpoint is red, change the level.
                    if(currentMap[x + tileWidth * y] === 3) {
                        currentLevel++;

                        //Check If all levels have been played.
                        if(currentLevel >= Math.min(tileLevels.length, patternLevels.length)) {
                            alert('YOU WON !');
                        } else {
                            levelChange = true;
                            levelChangeTime = 0;
                            levelChangeCounter = 0;
                            levelChangeMap = currentMap.slice(0);
                            //Update the level display.
                            document.getElementById("currentLevel").innerHTML = "Level: " + (currentLevel + 1);

                            checkpointTileMap = tileLevels[currentLevel];
                            checkpointPatternMap = patternLevels[currentLevel];

                            currentMap = tileLevels[currentLevel].slice(0);
                            currentPattern = patternLevels[currentLevel].slice(0);
                        }
                    } else { //The checkpoint is blue.
                        checkpointTileMap = currentMap.slice(0);
                        checkpointPatternMap = currentPattern.slice(0);
                    }

                    //Activate the new checkpoint
                    currentMap[x + tileWidth * y] = 4;
                    checkpointX = x;
                    checkpointY = y;
                }
            } else { //The player cannot move. Notify him.
                errorX = x + dx;
                errorY = y + dy;
                errorSound.play();

                setTimeout(function() {
                    errorX = null;
                    errorY = null;
                }, 400);
            }
        }

        //Clear the released keys queue.
        releasedKeys = [];
    } else {
        var rand1, rand2, temp;

        levelChangeTime += timeElapsed;

        while(levelChangeTime > 5) {
            rand1 = Math.floor(Math.random() * tileAmount);

            rand2 = Math.floor(Math.random() * 2);
            if(rand2 === 0) {
                rand2 = -1;
            }

            if(Math.random() < 0.5) {
                rand2 += rand1;
            } else {
                rand2 = rand1 + rand2 * tileWidth;
            }
            
            if(rand2 < 0) {
                rand2 += tileAmount;
            } else if(rand2 >= tileAmount) {
                rand2 -= tileAmount;
            }
            
            temp = levelChangeMap[rand1];
            levelChangeMap[rand1] = levelChangeMap[rand2];
            levelChangeMap[rand2] = temp;

            levelChangeTime -= 5;
            levelChangeCounter += 1;
        }

        if(levelChangeCounter > (3 * 200)) {
            levelChange = false
        }
    }
}

function render() {
    var j, i, tile;

    //Clear the canvas.
    context.fillStyle = '#EFEFEF';
    context.fillRect(0, 0, width, height);

    //Render the tiles.
    if(!levelChange) {
        for(j = 0; j < tileHeight; j++) {
            for(i = 0; i < tileWidth; i++) {
                tile = currentMap[i + tileWidth * j];

                //Use a tile with an arrow when the block is moving.
                if(tile === 1 && currentPattern[i + tileWidth * j] !== '') {
                    switch(currentPattern[i + tileWidth * j][0]) {
                        case 'g':
                            tile = 5;
                            break;
                        case 'h':
                            tile = 6;
                            break;
                        case 'd':
                            tile = 7;
                            break;
                        case 'b':
                            tile = 8;
                            break;
                        case '-':
                            tile = 9;
                            break;
                    }
                }

                //Draw the tile.
                context.drawImage(tileset, tileSize * tile, 0, tileSize, tileSize, i * tileSize, j * tileSize, tileSize, tileSize);
            }
        }

        //Render the red cross for error feedback.
        if(errorX !== null && errorY !== null) {
            context.drawImage(errorImage, errorX * tileSize, errorY * tileSize);
        }
    } else {
        for(j = 0; j < tileHeight; j++) {
            for(i = 0; i < tileWidth; i++) {
                tile = levelChangeMap[i + tileWidth * j];

                //Draw the tile.
                context.drawImage(tileset, tileSize * tile, 0, tileSize, tileSize, i * tileSize, j * tileSize, tileSize, tileSize);
            }
        }
    }

    //Render the character
    context.fillStyle = '#FBF236';
    context.beginPath();
    context.arc(Math.floor((x + 0.5) * tileSize), Math.floor((y + 0.5) * tileSize), 5, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
}

function showMessage(text, x, y, color, font){
    context.font = font;
    context.fillStyle = color;
    context.fillText(text, x, y);
}

/* ------------------------------------------------------------------------ */

showMessage('Loading', canvas.width / 2, canvas.height / 2, '#EFEFEF', '18px Arial');

for(i = 0; i < tileHeight; i++) {
    for(j = 0; j < tileWidth; j++) {
        if(checkpointTileMap[j + tileWidth * i] === 4) {
            x = checkpointX = j;
            y = checkpointY = i;
        }
    }
}

//Start the game loop once the assets are loaded.
var tileset = new Image(),
    errorImage = new Image(),
    errorSound = new Audio();

errorSound.addEventListener('canplaythrough', function() {
    errorImage.src = 'error.png';
}, false);

errorImage.addEventListener('load', function() {
    tileset.src = 'tileset.png';
}, false);

tileset.addEventListener('load', function() {
    lastTime = new Date().getTime();
    requestAnimationFrame(onEnterFrame);
}, false);

errorSound.src = 'error.mp3';
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
    keys = {}
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

/* ------------------------------------------------------------------------ */

//Game-related declarations.
var x = 0,
    y = 0,
    currentLevel = 0,
    tileMap1 =    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 
                  1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 
                  1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 3, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 
                  1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
                  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],

    patternMap1 = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', 'bbhh', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ddddddbbbbbbgggggghhhhhh', 'dddddbbbbbbgggggghhhhhhd', 'ddddbbbbbbgggggghhhhhhdd', 'dddbbbbbbgggggghhhhhhddd', 'ddbbbbbbgggggghhhhhhdddd', 'dbbbbbbgggggghhhhhhddddd',  'bbbbbbgggggghhhhhhdddddd', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hddddddbbbbbbgggggghhhhh', '', '', '', '',                                                                                                                              'bbbbbgggggghhhhhhddddddb', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhddddddbbbbbbgggggghhhh', '', '', '', '',                                                                                                                              'bbbbgggggghhhhhhddddddbb', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhhddddddbbbbbbgggggghhh', '', '', '', '',                                                                                                                              'bbbgggggghhhhhhddddddbbb', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhhhddddddbbbbbbgggggghh', '', '', '', '',                                                                                                                              'bbgggggghhhhhhddddddbbbb', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhhhhddddddbbbbbbggggggh', '', '', '', '',                                                                                                                              'bgggggghhhhhhddddddbbbbb', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', 'gb-----hd', '', '', '', '', '', '', '', '', '', '', 'hhhhhhddddddbbbbbbgggggg', 'ghhhhhhddddddbbbbbbggggg', 'gghhhhhhddddddbbbbbbgggg', 'ggghhhhhhddddddbbbbbbggg', 'gggghhhhhhddddddbbbbbbgg', 'ggggghhhhhhddddddbbbbbbg',  'gggggghhhhhhddddddbbbbbb', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', 'hbbh', '', 'bhhb', '', 'hbbh', '', 'bhhb', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                 ],

    tileMap2 =    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 3, 1, 1, 
                  1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 
                  1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
                  1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 
                  1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
                  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 
                  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],

    patternMap2 = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', 'bbhh', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'ddddddbbbbbbgggggghhhhhh', 'dddddbbbbbbgggggghhhhhhd', 'ddddbbbbbbgggggghhhhhhdd', 'dddbbbbbbgggggghhhhhhddd', 'ddbbbbbbgggggghhhhhhdddd', 'dbbbbbbgggggghhhhhhddddd',  'bbbbbbgggggghhhhhhdddddd', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hddddddbbbbbbgggggghhhhh', '', '', '', '',                                                                                                                              'bbbbbgggggghhhhhhddddddb', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhddddddbbbbbbgggggghhhh', '', '', '', '',                                                                                                                              'bbbbgggggghhhhhhddddddbb', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhhddddddbbbbbbgggggghhh', '', '', '', '',                                                                                                                              'bbbgggggghhhhhhddddddbbb', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhhhddddddbbbbbbgggggghh', '', '', '', '',                                                                                                                              'bbgggggghhhhhhddddddbbbb', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'hhhhhddddddbbbbbbggggggh', '', '', '', '',                                                                                                                              'bgggggghhhhhhddddddbbbbb', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', 'gb-----hd', '', '', '', '', '', '', '', '', '', '', 'hhhhhhddddddbbbbbbgggggg', 'ghhhhhhddddddbbbbbbggggg', 'gghhhhhhddddddbbbbbbgggg', 'ggghhhhhhddddddbbbbbbggg', 'gggghhhhhhddddddbbbbbbgg', 'ggggghhhhhhddddddbbbbbbg',  'gggggghhhhhhddddddbbbbbb', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', 'hbbh', '', 'bhhb', '', 'hbbh', '', 'bhhb', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                  '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
                 ],

    tileLevels = [
      tileMap1,
      tileMap2
    ],

    patternLevels = [
      patternMap1,
      patternMap2
    ],
    
    errorX = null,
    errorY = null,
    checkpointX = x,
    checkpointY = y,
    currentMap = tileLevels[currentLevel].slice(0),
    currentPattern = patternLevels[currentLevel].slice(0),
    checkpointTileMap = tileLevels[currentLevel].slice(0),
    checkpointPatternMap = patternMap1[currentLevel].slice(0),
    score = 0;


function update(timeElapsed) {
    //Process inputs.
    var dx = 0,
        dy = 0;

    if(releasedKeys[0] === 'R') {
        //TODO Reset sound and visual effect.
        x = checkpointX;
        y = checkpointY;
        currentMap = checkpointTileMap.slice(0);
        patternMap1 = checkpointPatternMap.slice(0);

    } else if(releasedKeys[0] === '&') { //Up arrow.
        dy = -1;
    } else if(releasedKeys[0] === '(') { //Down arrow.
        dy = 1;
    } else if(releasedKeys[0] === '%') { //Left arrow.
        dx = -1;
    } else if(releasedKeys[0] === "'") { //Right arrow.
        dx = 1;
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
                pattern = patternMap1[index];
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
            patternMap1 = newPatternMap;

            x = x + dx;
            y = y + dy;

            errorX = null;
            errorY = null;

            //If a checkpoint is reached.
            if(currentMap[x + tileWidth * y] === 2) {
                //Remove the old one.
                currentMap[checkpointX + tileWidth * checkpointY] = 0;

                //Activate the new checkpoint
                currentMap[x + tileWidth * y] = 3;
                currentLevel++;
                checkpointTileMap = tileLevels[currentLevel];
                checkpointPatternMap = patternLevels[currentLevel];
                currentMap = tileLevels[currentLevel];
                currentPattern = patternLevels[currentPattern];
                checkpointX = x;
                checkpointY = y;

            }
        } else if(currentMap[x + dx + tileWidth * (y + dy)] === 0) {
            errorX = x + dx;
            errorY = y + dy;
            errorSound.play();

            setTimeout(function() {
                errorX = null;
                errorY = null;
            }, 400);
        }

    }

    document.getElementById("currentLevel").innerHTML = "Level: " + (currentLevel + 1);

    //Clear the released keys queue.
    releasedKeys = [];
}

function render() {
    context.fillStyle = '#EFEFEF';
    context.fillRect(0, 0, width, height);

    var j, i, tile;

    for(j = 0; j < tileHeight; j++) {
        for(i = 0; i < tileWidth; i++) {
            tile = currentMap[i + tileWidth * j];

            context.drawImage(tileset, tileSize * tile, 0, tileSize, tileSize, i * tileSize, j * tileSize, tileSize, tileSize);
        }
    }

    if(errorX !== null && errorY !== null) {
        context.drawImage(errorImage, errorX * tileSize, errorY * tileSize);
    }

    context.fillStyle = '#46E884'
    context.beginPath();
    context.arc(Math.floor((x + 0.5) * tileSize), Math.floor((y + 0.5) * tileSize), 5, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
}


/* ------------------------------------------------------------------------ */

context.font = '18px Arial';
context.fillText('Loading...', canvas.width / 2, canvas.height / 2);

for (i = 0; i < tileHeight; i++){
  for (j = 0; j < tileWidth; j++){
    if (checkpointTileMap[j + tileWidth * i] === 3){
      x = checkpointX = j;
      y = checkpointY = i;
    }
  }
}

//Start the game loop once the assets are loaded.
var tileset = new Image(),
    errorImage = new Image(),
    errorSound = new Audio();

//errorSound.addEventListener('canplaythrough', function() {
    errorImage.src = 'error.png';
//}, false);

errorImage.addEventListener('load', function() {
    tileset.src = 'tileset.png';
}, false);

tileset.addEventListener('load', function() {
    lastTime = new Date().getTime();
    requestAnimationFrame(onEnterFrame);
}, false);

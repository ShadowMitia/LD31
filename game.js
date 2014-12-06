//Settings.
var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    width = 500,
    height = 500,
    fps = 60,
    minFps = 4;

//Engine variables. Time is handled in milliseconds.
var requestAnimationFrame = window.requestAnimationFrame
                            || window.mozRequestAnimationFrame
                            || window.webkitRequestAnimationFrame
                            || window.msRequestAnimationFrame,
    body = document.getElementsByTagName('body')[0],
    keys = {},
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

/* ------------------------------------------------------------------------ */

//Game-related declarations.
var x = 250,
    y = 250,
    v = 0.1;


function update(timeElapsed) {
    x += v * timeElapsed;
    y += v * timeElapsed;

    while(x >= 500) {
        x -= 500;
    }

    while(y >= 500) {
        y -= 500;
    }
}

function render() {
    context.fillStyle = '#EFEFEF';
    context.fillRect(0, 0, width, height);

    context.fillStyle = '#46E884'
    context.beginPath();
    context.arc(x, y, 5, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
}

/* ------------------------------------------------------------------------ */

//Start the game loop.
lastTime = new Date().getTime();
requestAnimationFrame(onEnterFrame);
// ===== Canvas =====
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// ===== HUD =====
const livesEl = document.getElementById("lives");
const coinsEl = document.getElementById("coins");
const scoreEl = document.getElementById("score");

// ===== Player =====
const player = {
    x: 120,
    y: 120,
    radius: 15,
    speed: 3,
    color: "#00ff66"
};

let lives = 3;
let coins = 0;
let score = 0;

// ===== Keyboard Input =====
const keys = {};

window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

// ===== Mobile Controls =====
function hold(id, key) {
    const btn = document.getElementById(id);

    btn.addEventListener("touchstart", e => {
        e.preventDefault();
        keys[key] = true;
    });

    btn.addEventListener("touchend", e => {
        e.preventDefault();
        keys[key] = false;
    });
}

hold("up", "w");
hold("down", "s");
hold("left", "a");
hold("right", "d");

// ===== Movement =====
function movePlayer() {

    if (keys["w"] || keys["arrowup"])
        player.y -= player.speed;

    if (keys["s"] || keys["arrowdown"])
        player.y += player.speed;

    if (keys["a"] || keys["arrowleft"])
        player.x -= player.speed;

    if (keys["d"] || keys["arrowright"])
        player.x += player.speed;

    // Keep player inside screen
    player.x = Math.max(player.radius,
        Math.min(canvas.width - player.radius, player.x));

    player.y = Math.max(player.radius,
        Math.min(canvas.height - player.radius, player.y));
}

// ===== Draw Player =====
function drawPlayer() {

    ctx.beginPath();
    ctx.arc(
        player.x,
        player.y,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = player.color;
    ctx.fill();
}

// ===== HUD Update =====
function updateHUD() {
    livesEl.textContent = lives;
    coinsEl.textContent = coins;
    scoreEl.textContent = score;
}
function gameLoop() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    movePlayer();
    moveGuards();

    collectCoins();
    guardLogic();

    drawWalls();
    drawCoins();
    drawExit();
    drawGuards();
    drawPlayer();

    checkWin();
    updateHUD();

    requestAnimationFrame(gameLoop);
}

gameLoop();
// ==============================
// WALLS
// ==============================

const walls = [
    {x:150,y:100,w:200,h:25},
    {x:500,y:180,w:25,h:220},
    {x:250,y:420,w:260,h:25},
    {x:700,y:120,w:180,h:25},
    {x:850,y:300,w:25,h:220}
];

// ==============================
// COINS
// ==============================

const coinList = [
    {x:100,y:300,taken:false},
    {x:350,y:250,taken:false},
    {x:600,y:450,taken:false},
    {x:900,y:150,taken:false},
    {x:750,y:520,taken:false}
];

// ==============================
// GUARDS
// ==============================

const guards = [

{
    x:500,
    y:90,
    r:15,
    dir:1,
    speed:2,
    minX:450,
    maxX:800,
    alive:true
},

{
    x:220,
    y:520,
    r:15,
    dir:1,
    speed:2,
    minX:180,
    maxX:600,
    alive:true
}

];

// ==============================
// DRAW WALLS
// ==============================

function drawWalls(){

    ctx.fillStyle="#444";

    walls.forEach(w=>{

        ctx.fillRect(
            w.x,
            w.y,
            w.w,
            w.h
        );

    });

}

// ==============================
// DRAW COINS
// ==============================

function drawCoins(){

    coinList.forEach(c=>{

        if(c.taken) return;

        ctx.beginPath();

        ctx.arc(
            c.x,
            c.y,
            8,
            0,
            Math.PI*2
        );

        ctx.fillStyle="gold";
        ctx.fill();

    });

}

// ==============================
// MOVE GUARDS
// ==============================

function moveGuards(){

    guards.forEach(g=>{

        if(!g.alive) return;

        g.x += g.speed*g.dir;

        if(g.x<g.minX)
            g.dir=1;

        if(g.x>g.maxX)
            g.dir=-1;

    });

}

// ==============================
// DRAW GUARDS
// ==============================

function drawGuards(){

    guards.forEach(g=>{

        if(!g.alive) return;

        ctx.beginPath();

        ctx.arc(
            g.x,
            g.y,
            g.r,
            0,
            Math.PI*2
        );

        ctx.fillStyle="red";
        ctx.fill();

    });

  }function gameLoop(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    movePlayer();
    moveGuards();

    drawWalls();
    drawCoins();
    drawGuards();
    drawPlayer();

    updateHUD();

    requestAnimationFrame(gameLoop);
}// ==============================
// EXIT DOOR
// ==============================

const exitDoor = {
    x: canvas.width - 80,
    y: canvas.height - 80,
    w: 40,
    h: 40
};

// ==============================
// Distance Helper
// ==============================

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

// ==============================
// Coin Collection
// ==============================

function collectCoins() {

    coinList.forEach(c => {

        if (c.taken) return;

        if (distance(player.x, player.y, c.x, c.y) < 20) {

            c.taken = true;
            coins++;
            score += 100;

        }

    });

}

// ==============================
// Enemy Detection & Stealth Kill
// ==============================

function guardLogic() {

    guards.forEach(g => {

        if (!g.alive) return;

        let d = distance(player.x, player.y, g.x, g.y);

        // Kill from behind
        if (d < 22) {

            g.alive = false;
            score += 300;
            return;

        }

        // Guard catches player
        if (d < 90) {

            lives--;

            player.x = 120;
            player.y = 120;

            if (lives <= 0) {

                alert("Game Over!");

                location.reload();

            }

        }

    });

}

// ==============================
// Draw Exit
// ==============================

function drawExit() {

    ctx.fillStyle = "lime";

    ctx.fillRect(
        exitDoor.x,
        exitDoor.y,
        exitDoor.w,
        exitDoor.h
    );

}

// ==============================
// Check Level Complete
// ==============================

function checkWin() {

    let allDead = guards.every(g => !g.alive);

    if (!allDead)
        return;

    if (
        player.x > exitDoor.x &&
        player.y > exitDoor.y
    ) {

        alert("Level Complete!");

        location.reload();

    }

          }

const canvas = document.getElementById('jatekter');
const ctx = canvas.getContext('2d');

//          Zene

const backgroundMusic = new Audio('sounds/Sanctuary Guardians.mp3');
backgroundMusic.loop = true; // ismétlődjön végtelenül
backgroundMusic.volume = 0.1; // opcionálisan halkabbra


let pontMentve = false;
let freezeUntil = 0;

//          PLAYER

let player = { x: (canvas.width -40) / 2, y: 1000, width: 83, height: 108, speed: 1.5 };
let playerImage = new Image();

const selectedCharacter = localStorage.getItem('selectedCharacter') || './images/Characters/Tung.png';  // memóriábol kiveszi hogy mit választottunk
playerImage.src = selectedCharacter;


let playerBalra = true;


//          PLANE

let plane =  { x: 0, y: 50, width: 200, height: 100, speed: 0.7 };
let planeImage = new Image();
planeImage.src = './images/Characters/bombardinoCrocodilo.png'
let bombs = [];
let bombSpeed = 1;

//          GAME

let gameOver = false;
let startTime = Date.now();
let elapsedTime = 0;

let difficulty = localStorage.getItem('difficulty') || 'medium';
let scoreMultiplier = 1;

switch (difficulty) {
  case 'easy':
    bombSpeed = 0.8;
    scoreMultiplier = 1;
    break;
  case 'medium':
    bombSpeed = 1.2;
    scoreMultiplier = 1.25;
    break;
  case 'hard':
    bombSpeed = 1.8;
    scoreMultiplier = 1.5
    break;
}



//          Bomb hullámok

let lastWaveTime = 0;
let waveInterval = 15000; // 15 másodpercenként hullám
let waveBombCount = 6;
let waveActive = false;

document.addEventListener('keydown', () => {
    if (backgroundMusic.paused) {
        backgroundMusic.play();
    }
});



planeImage.onload = function() {
    requestAnimationFrame(gameLoop);
};

// játékos vezérlése

let keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true)
document.addEventListener('keyup', (e) => keys[e.key] = false)

// bomba dopás timer
let bombInterval = 1000; 
let utolsoBombaIdo = Date.now();

function update() {
    if(gameOver){
        return;
    }

    // repulo mozgasa

    plane.x += plane.speed;
    if(plane.x + plane.width > canvas.width || plane.x < 0) {
        plane.speed *= -1;      // vissza fordul
    }

    // jatekos mozgása

    if(Date.now() > freezeUntil && keys['ArrowLeft'] && player.x > 0){
        player.x -= player.speed;
        playerBalra = true;
    } 

    if(Date.now() > freezeUntil && keys['ArrowRight'] && player.x + player.width < canvas.width){
        player.x += player.speed;
        playerBalra = false;
    }


    let currentTime = Date.now();

    if (!waveActive && currentTime - lastWaveTime > waveInterval) {
    waveActive = true;
    lastWaveTime = currentTime;

        // hullám: egyszerre több bomba különböző x helyekről
        for (let i = 0; i < waveBombCount; i++) {
            let randomX = Math.random() * (canvas.width - 10); // véletlen pozíció
            bombs.push({
                x: randomX,
                y: plane.y + plane.height,
                width: 10,
                height: 10,
                speed: bombSpeed + 1,
                type: 'normal',
                color: 'orange'
            });
        }

     // hullám vége: csak 2 másodpercig aktív, hogy ne induljon újra rögtön
        setTimeout(() => {
        waveActive = false;
        }, 2000);
    }



    // bombázás
    if(Date.now() - utolsoBombaIdo > bombInterval){
        const randomType = Math.random();
        let bomb = {
            x: plane.x + plane.width/2,
            y: plane.y + plane.height,
            width: 10,
            height: 10,
            speed: bombSpeed,
            type: 'normal',
            color: 'black'
        };

        if(randomType < 0.2){
            bomb.type = 'freeze';
            bomb.color = 'blue';
        }

        bombs.push(bomb)
        utolsoBombaIdo = Date.now();
    
        // nehezítés

    }

    bombs.forEach(bomb => bomb.y += bombSpeed);


    // ütközés
    let collidedBombIndexes = [];

   bombs.forEach((bomb, index) => {
    if (
        bomb.x < player.x + player.width &&
        bomb.x + bomb.width > player.x &&
        bomb.y < player.y + player.height &&
        bomb.y + bomb.height > player.y
    ) {
        if (bomb.type === 'freeze') {
            freezeUntil = Date.now() + 3000;
            collidedBombIndexes.push(index); // jegyezzük meg
        } else {
            gameOver = true;
        }
    }
});
    // talált bombák eltávolítása
    bombs = bombs.filter((_, index) => !collidedBombIndexes.includes(index));
}


function draw(){

    if(!gameOver){
        elapsedTime = Math.floor((Date.now() - startTime) / 1000 );
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // repcsi
    if (plane.speed > 0) {
        ctx.save();
        ctx.scale(-1, 1); // tükrözés
        ctx.drawImage(planeImage, -plane.x - plane.width, plane.y, plane.width, plane.height);
        ctx.restore();
    } else {
        ctx.drawImage(planeImage, plane.x, plane.y, plane.width, plane.height); 
    }



    // player

    if (!playerBalra) {
        ctx.save();
        ctx.scale(-1, 1); // tükrözés
        ctx.drawImage(playerImage, -player.x - player.width, player.y, player.width, player.height);
        ctx.restore();
    } else {
        ctx.drawImage(playerImage, player.x, player.y, player.width, player.height); 
    }

    // kék overlay ha meg van fagyva
    if (Date.now() < freezeUntil) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = 'lightblue';
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.restore();
    }
    

    //ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

    // bombák

    bombs.forEach(bomb=>{
        ctx.fillStyle = bomb.color || 'black';
        ctx.fillRect(bomb.x, bomb.y, bomb.width || 10, bomb.height || 10);
    });


    ctx.fillStyle = 'white';
    ctx.font = '24px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Idő: ${elapsedTime} mp`, 20, 30);


    if (gameOver){
        if (!pontMentve) {
            pontMentve = true;
    
            const score = (elapsedTime * 10) * scoreMultiplier;
            const name = prompt("Add meg a neved:");
            if (name) {
                let scores = JSON.parse(localStorage.getItem("leaderboard")) || [];
                scores.push({ name: name, score: score });
                scores.sort((a, b) => b.score - a.score);
                scores = scores.slice(0, 10);
                localStorage.setItem("leaderboard", JSON.stringify(scores));
            }
    
            setTimeout(() => {
                window.location.href = 'scoreboard.html';
            }, 2000);
        }
    
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign='center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    }

    if (waveActive) {
    ctx.fillStyle = 'yellow';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💥 Bomba Hullám! 💥', canvas.width / 2, 60);
}

}

function gameLoop(){
    update();
    draw();
    if(!gameOver){
        requestAnimationFrame(gameLoop);
    }
}

gameLoop();

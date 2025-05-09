const canvas = document.getElementById('jatekter');
const ctx = canvas.getContext('2d');

let pontMentve = false;

//          PLAYER

let player = { x: (canvas.width -40) / 2, y: 1000, width: 83, height: 108, speed: 1.5 };
let playerImage = new Image();

const selectedCharacter = localStorage.getItem('selectedCharacter') || './images/Characters/Tung.pngg';  // memóriábol kiveszi hogy mit választottunk
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



planeImage.onload = function() {
    requestAnimationFrame(gameLoop); // Csak akkor indul el, ha a kép betöltődött
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

    if(keys['ArrowLeft'] && player.x > 0){
        player.x -= player.speed;
        playerBalra = true;
    } 

    if(keys['ArrowRight'] && player.x + player.width < canvas.width){
        player.x += player.speed;
        playerBalra = false;
    } 


    // bombázás
    if(Date.now() - utolsoBombaIdo > bombInterval){
        bombs.push({x: plane.x + plane.width/2, y: plane.y + plane.height });
        utolsoBombaIdo = Date.now();
    
        // nehezítés

    }

    bombs.forEach(bomb => bomb.y += bombSpeed);

    // ütközés
    bombs.forEach(bomb => {
        if(bomb.x < player.x + player.width && bomb.x + 10 > player.x && bomb.y < player.y + player.height && bomb.y + 10 > player.y){
            gameOver = true;
        }
    });
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
    if(!playerBalra){
        ctx.save();
        ctx.scale(-1, 1); // tükrözés
        ctx.drawImage(playerImage, -player.x - player.width, player.y, player.width, player.height);
        ctx.restore();
    } else {
        ctx.drawImage(playerImage, player.x, player.y, player.width, player.height); 
    }
    

    //ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

    // bombák
    ctx.fillStyle = 'red';
    bombs.forEach(bomb => ctx.fillRect(bomb.x, bomb.y, 10, 10));

    ctx.fillStyle = 'white';
    ctx.font = '24px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Idő: ${elapsedTime} mp`, 20, 30);


    if (gameOver){
        if (!pontMentve) {
            pontMentve = true;
    
            const score = elapsedTime * 10;
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

}

function gameLoop(){
    update();
    draw();
    if(!gameOver){
        requestAnimationFrame(gameLoop);
    }
}

gameLoop();

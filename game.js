const canvas = document.getElementById('jatekter');
const ctx = canvas.getContext('2d');

let player = { x: 280, y: 500, width: 40, height: 40, speed: 5 };
let plane =  { x: 0, y: 50, width: 60, height: 30, speed: 2 };
let bombs = [];
let bombSpeed = 2;
let gameOver = false;

// játékos vezérlése

let keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true)
document.addEventListener('keyup', (e) => keys[e.key] = false)

// bomba dopás timer
let bombInterval = 2000; 
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

    if(keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;

    if(keys['ArrowRight'] && player.x + player.width < canvas.width) player.x += player.speed;


    // bombázás
    if(Date.now() - utolsoBombaIdo > bombInterval){
        bombs.push({x: plane.x + plane.width/2, y: plane.y + plane.height });
        utolsoBombaIdo = Date.now();
    
        // nehezítés
        if(bombInterval > 500){
            bombInterval -= 100;
        }
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // repcsi
    ctx.fillStyle='white';
    ctx.fillRect(plane.x, plane.y, plane.width, plane.height);

    // player
    ctx.fillStyle='green';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // bombák
    ctx.fillStyle = 'red';
    bombs.forEach(bomb => ctx.fillRect(bomb.x, bomb.y, 10, 10));

    if(gameOver){
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign='center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);

        setTimeout(() => {
            window.location.href = 'scoreboard.html';
        }, 2000);
        
    }

}

function gameLopop(){
    update();
    draw();
    if(!gameOver){
        requestAnimationFrame(gameLopop);
    }
}

gameLopop();







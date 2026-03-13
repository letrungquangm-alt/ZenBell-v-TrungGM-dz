// --- GAME NGỰ XÀ (SNAKE) ---
const SnakeGame = (function() {
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    const sz = 15;
    const cols = 20;
    const rows = 30; 
    let snake = [];
    let food = {};
    let dx = 0, dy = -1;
    let score = 0;
    let loopId;
    let last = 0;
    let speed = 120;
    let isGO = false;

    function startReal() { 
        inputQueue = []; 
        isGO = false; 
        
        if (currentGameDifficulty === 'easy') speed = 160;
        else if (currentGameDifficulty === 'hard') speed = 70;
        else if (currentGameDifficulty === 'expert') speed = 40;
        else speed = 120;
        
        snake = [{x: 10, y: 15}, {x: 10, y: 16}, {x: 10, y: 17}]; 
        dx = 0; 
        dy = -1; 
        score = 0; 
        place(); 
        $('snake-score').innerText = `Điểm: ${score}`; 
        $('snake-go').style.display = 'none'; 
        cancelAnimationFrame(loopId); 
        last = 0; 
        loopId = requestAnimationFrame(loop); 
    }

    function place() { 
        food = { 
            x: Math.floor(Math.random() * cols), 
            y: Math.floor(Math.random() * rows) 
        }; 
    }

    function update() { 
        if(isGO) return; 
        
        while(inputQueue.length > 0) { 
            let a = inputQueue.shift(); 
            if(a === 'UP' && dy === 0) { dx = 0; dy = -1; break; } 
            if(a === 'DOWN' && dy === 0) { dx = 0; dy = 1; break; } 
            if(a === 'LEFT' && dx === 0) { dx = -1; dy = 0; break; } 
            if(a === 'RIGHT' && dx === 0) { dx = 1; dy = 0; break; } 
        } 
        
        let head = { x: snake[0].x + dx, y: snake[0].y + dy }; 
        
        let isHitWall = head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows;
        let isHitSelf = snake.some(s => s.x === head.x && s.y === head.y);
        
        if(isHitWall || isHitSelf) { 
            isGO = true; 
            playSfx('boom'); 
            $('snake-final-score').innerText = `Điểm: ${score}`; 
            $('snake-go').style.display = 'flex'; 
            return; 
        } 
        
        snake.unshift(head);
        
        if(head.x === food.x && head.y === food.y) { 
            playSfx('eat'); 
            score += 10; 
            $('snake-score').innerText = `Điểm: ${score}`; 
            place(); 
        } else {
            snake.pop(); 
        }
    }

    function draw() { 
        ctx.fillStyle = '#0a0508'; 
        ctx.fillRect(0, 0, 300, 450); 
        
        ctx.fillStyle = '#e74c3c'; 
        ctx.fillRect(food.x * sz, food.y * sz, sz - 1, sz - 1); 
        
        snake.forEach((s, i) => { 
            ctx.fillStyle = i === 0 ? '#2ecc71' : '#27ae60'; 
            ctx.fillRect(s.x * sz, s.y * sz, sz - 1, sz - 1); 
        }); 
    }

    function loop(t) { 
        if(isGO) return; 
        if(!last) last = t; 
        if(t - last > speed) { 
            update(); 
            draw(); 
            last = t; 
        } 
        loopId = requestAnimationFrame(loop); 
    }

    return { 
        startReal, 
        stop: () => { 
            isGO = true; 
            cancelAnimationFrame(loopId); 
        } 
    };
})();
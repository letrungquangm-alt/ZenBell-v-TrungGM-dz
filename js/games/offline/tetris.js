// --- GAME XẾP THÀNH (TETRIS) ---
const TetrisGame = (function() {
    const canvas = document.getElementById('tetris-canvas');
    const ctx = canvas.getContext('2d');
    const cols = 10;
    const rows = 20;
    const sq = 24;
    
    const pieces = [ 
        [[1, 1, 1, 1]], 
        [[1, 1], [1, 1]], 
        [[0, 1, 0], [1, 1, 1]], 
        [[1, 0, 0], [1, 1, 1]], 
        [[0, 0, 1], [1, 1, 1]], 
        [[0, 1, 1], [1, 1, 0]], 
        [[1, 1, 0], [0, 1, 1]] 
    ]; 
    const colors = ["#00FFFF", "#FFD700", "#FF00FF", "#FF4500", "#0088FF", "#00FF00", "#FF0000"]; 
    
    let board = [];
    let score = 0;
    let loopId;
    let startT = 0;
    let speed = 600;
    let isGO = false;
    let p = { x: 3, y: 0, shape: [], color: "" };

    function startReal() { 
        inputQueue = []; 
        isTetrisDownPressed = false; 
        isGO = false; 
        
        if (currentGameDifficulty === 'easy') speed = 900;
        else if (currentGameDifficulty === 'hard') speed = 300;
        else if (currentGameDifficulty === 'expert') speed = 150;
        else speed = 600;
        
        board = Array.from({length: rows}, () => Array(cols).fill("#0a0508")); 
        score = 0; 
        $('tetris-score').innerText = `Điểm: ${score}`; 
        $('tetris-go').style.display = 'none'; 
        spawn(); 
        cancelAnimationFrame(loopId); 
        startT = 0; 
        loopId = requestAnimationFrame(loop); 
    }

    function spawn() { 
        let r = Math.floor(Math.random() * pieces.length); 
        p.shape = pieces[r]; 
        p.color = colors[r]; 
        p.x = 3; 
        p.y = 0; 
        
        if(coll(0, 0, p.shape)) { 
            isGO = true; 
            playSfx('boom'); 
            $('tetris-final-score').innerText = `Điểm: ${score}`; 
            $('tetris-go').style.display = 'flex'; 
        } 
    }

    function coll(xo, yo, sh) { 
        for(let r = 0; r < sh.length; r++) { 
            for(let c = 0; c < sh[r].length; c++) { 
                if(!sh[r][c]) continue; 
                let nx = p.x + c + xo;
                let ny = p.y + r + yo; 
                
                if(nx < 0 || nx >= cols || ny >= rows) return true; 
                if(ny < 0) continue; 
                if(board[ny][nx] !== "#0a0508") return true; 
            } 
        } 
        return false; 
    }

    function drawSq(x, y, c) { 
        ctx.fillStyle = "#0a0508"; 
        ctx.fillRect(x * sq, y * sq, sq, sq); 
        ctx.lineWidth = 4; 
        ctx.strokeStyle = c; 
        ctx.strokeRect(x * sq + 2, y * sq + 2, sq - 4, sq - 4); 
    }

    function draw() { 
        ctx.fillStyle = "#0a0508"; 
        ctx.fillRect(0, 0, 240, 480); 
        
        for(let r = 0; r < rows; r++) {
            for(let c = 0; c < cols; c++) {
                if(board[r][c] !== "#0a0508") {
                    drawSq(c, r, board[r][c]); 
                }
            }
        }
        
        if(!isGO) {
            p.shape.forEach((r, ri) => { 
                r.forEach((v, ci) => { 
                    if(v) drawSq(p.x + ci, p.y + ri, p.color); 
                }); 
            }); 
        }
    }

    function lock() { 
        if(isGO) return; 
        
        p.shape.forEach((r, ri) => { 
            r.forEach((v, ci) => { 
                if(v && p.y + ri >= 0) {
                    board[p.y + ri][p.x + ci] = p.color; 
                }
            }); 
        }); 
        
        let lines = 0; 
        for(let r = 0; r < rows; r++) { 
            if(board[r].every(v => v !== "#0a0508")) { 
                board.splice(r, 1); 
                board.unshift(Array(cols).fill("#0a0508")); 
                lines++; 
            } 
        } 
        
        if(lines > 0) { 
            playSfx('eat'); 
            score += lines * 100; 
            $('tetris-score').innerText = `Điểm: ${score}`; 
        } 
        spawn(); 
    }

    function rotate() { 
        let next = []; 
        for(let i = 0; i < p.shape[0].length; i++) { 
            let row = []; 
            for(let j = p.shape.length - 1; j >= 0; j--) {
                row.push(p.shape[j][i]); 
            }
            next.push(row); 
        } 
        
        let k = 0; 
        if(coll(0, 0, next)) { 
            if(!coll(1, 0, next)) k = 1; 
            else if(!coll(-1, 0, next)) k = -1; 
            else k = null; 
        } 
        
        if(k !== null) { 
            p.x += k; 
            p.shape = next; 
            playSfx('move'); 
        } 
    }

    function update() { 
        if(inputQueue.length > 0) { 
            let a = inputQueue.shift(); 
            if(a === 'LEFT' && !coll(-1, 0, p.shape)) { p.x--; playSfx('move'); } 
            else if(a === 'RIGHT' && !coll(1, 0, p.shape)) { p.x++; playSfx('move'); } 
            else if(a === 'A' || a === 'UP') rotate(); 
        } 
    }

    function loop(t) { 
        if(isGO) return; 
        if(!startT) startT = t; 
        update(); 
        
        let s = isTetrisDownPressed ? 30 : speed; 
        
        if(t - startT > s) { 
            if(!coll(0, 1, p.shape)) {
                p.y++; 
            } else {
                lock(); 
            }
            startT = t; 
        } 
        
        draw(); 
        loopId = requestAnimationFrame(loop); 
    }

    return { 
        startReal, 
        stop: () => { 
            isGO = true; 
            isTetrisDownPressed = false; 
            cancelAnimationFrame(loopId); 
        } 
    };
})();
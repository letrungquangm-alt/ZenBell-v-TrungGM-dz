// =========================================
// 8. BẢNG ĐIỀU KHIỂN & CÁC MINI GAME (MAIN EVENT BINDINGS)
// =========================================
let currentTargetGame = null;
let currentGameDifficulty = 'normal';

function showDifficulty(gameName) { 
    currentTargetGame = gameName; 
    openModal('overlay-difficulty'); 
}

function selectDifficulty(diff) { 
    currentGameDifficulty = diff; 
    closeModal('overlay-difficulty'); 
    switchScreen(`${currentTargetGame}-screen`); 
    setTimeout(() => { 
        if(currentTargetGame === 'snake') {
            SnakeGame.startReal(); 
        } else if(currentTargetGame === 'tetris') {
            TetrisGame.startReal(); 
        }
    }, 400); 
}

function launchMiniGame(game, btnEl) { 
    switchScreen(`${game}-screen`, btnEl); 
    setTimeout(() => { 
        if(game === 'chicken') {
            ChickenGame.start(); 
        }
    }, 400); 
}

let inputQueue = [];
let isTetrisDownPressed = false;

function setInput(act) { 
    if(!act) return; 
    // Tránh spam cùng 1 nút liên tục trong queue
    if(inputQueue.length > 0 && inputQueue[inputQueue.length - 1] === act) return; 
    if(inputQueue.length < 5) inputQueue.push(act); 
}

function bindControls(prefix) { 
    const directions = ['up', 'down', 'left', 'right'];
    directions.forEach(dir => { 
        const btn = document.getElementById(`btn-${dir}-${prefix}`); 
        if(btn) { 
            const handlePress = (e) => { 
                e.preventDefault(); 
                if(dir === 'down' && prefix === 'tetris') isTetrisDownPressed = true; 
                setInput(dir.toUpperCase()); 
            }; 
            const handleRelease = (e) => { 
                e.preventDefault(); 
                if(dir === 'down' && prefix === 'tetris') isTetrisDownPressed = false; 
            }; 
            
            // Lắng nghe sự kiện cảm ứng và chuột
            btn.addEventListener('touchstart', handlePress, {passive: false}); 
            btn.addEventListener('mousedown', handlePress); 
            btn.addEventListener('touchend', handleRelease, {passive: false}); 
            btn.addEventListener('mouseup', handleRelease); 
            btn.addEventListener('mouseleave', handleRelease); 
        } 
    });
    
    const btnA = document.getElementById(`btn-a-${prefix}`); 
    if(btnA) { 
        const handleAPress = (e) => { 
            e.preventDefault(); 
            setInput('A'); 
        }; 
        btnA.addEventListener('touchstart', handleAPress, {passive: false}); 
        btnA.addEventListener('mousedown', handleAPress); 
    } 
}

// Gắn sự kiện điều khiển ảo cho các game
bindControls('snake'); 
bindControls('tetris');

// Bắt sự kiện bàn phím vật lý (cho PC)
document.addEventListener('keydown', (e) => { 
    if(e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') setInput('UP'); 
    if(e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { 
        setInput('DOWN'); 
        isTetrisDownPressed = true; 
    } 
    if(e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') setInput('LEFT'); 
    if(e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') setInput('RIGHT'); 
    if(e.key === ' ' || e.key === 'Enter') setInput('A'); 
});

document.addEventListener('keyup', (e) => { 
    if(e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        isTetrisDownPressed = false; 
    }
});
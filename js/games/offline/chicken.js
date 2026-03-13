// --- GAME BẮN KÊ (CHICKEN INVADERS) ---
const ChickenGame = (function() {
    const canvas = document.getElementById('chicken-canvas');
    const ctx = canvas.getContext('2d'); 
    let player, bullets, enemies, enemyBullets, particles;
    let score, loopId, frameCount;
    let isDragging = false, isGO = false;
    let gameMode = 'NORMAL', nextMilestone = 500, wavePhase = 0, waveDelay = 0, globalSpeedMult = 1.0; 
    const chickensPerRow = 7;

    function getCanvasPos(e) { 
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY; 
        return { 
            x: (clientX - rect.left) * (canvas.width / rect.width), 
            y: (clientY - rect.top) * (canvas.height / rect.height) 
        }; 
    }

    canvas.addEventListener('mousedown', (e) => { 
        if(!isGO) { 
            isDragging = true; 
            let pos = getCanvasPos(e); 
            player.x = Math.max(16, Math.min(304, pos.x)); 
            player.y = Math.max(16, Math.min(664, pos.y)); 
        } 
    }); 
    canvas.addEventListener('mousemove', (e) => { 
        if(isDragging && !isGO) { 
            let pos = getCanvasPos(e); 
            player.x = Math.max(16, Math.min(304, pos.x)); 
            player.y = Math.max(16, Math.min(664, pos.y)); 
        } 
    });
    canvas.addEventListener('mouseup', () => isDragging = false); 
    canvas.addEventListener('mouseleave', () => isDragging = false);
    canvas.addEventListener('touchstart', (e) => { 
        if(!isGO) { 
            e.preventDefault(); 
            isDragging = true; 
            let pos = getCanvasPos(e); 
            player.x = Math.max(16, Math.min(304, pos.x)); 
            player.y = Math.max(16, Math.min(664, pos.y)); 
        } 
    }, {passive: false});
    canvas.addEventListener('touchmove', (e) => { 
        if(isDragging && !isGO) { 
            e.preventDefault(); 
            let pos = getCanvasPos(e); 
            player.x = Math.max(16, Math.min(304, pos.x)); 
            player.y = Math.max(16, Math.min(664, pos.y)); 
        } 
    }, {passive: false});
    canvas.addEventListener('touchend', () => isDragging = false);

    function reset() { 
        player = { x: 160, y: 600, size: 16, hp: 10 }; 
        bullets = []; 
        enemies = []; 
        enemyBullets = []; 
        particles = []; 
        score = 0; 
        frameCount = 0; 
        isDragging = false; 
        isGO = false; 
        gameMode = 'NORMAL'; 
        nextMilestone = 500; 
        globalSpeedMult = 1.0; 
        $('chicken-score').innerText = `Điểm: ${score} | ❤️ ${player.hp}`; 
        $('chicken-go').style.display = 'none'; 
    }

    function boom(x, y, color) { 
        for(let i = 0; i < 15; i++) {
            particles.push({ 
                x: x, 
                y: y, 
                vx: (Math.random() - 0.5) * 6, 
                vy: (Math.random() - 0.5) * 6, 
                life: 1, 
                color: color || '#f1c40f' 
            }); 
        }
    }

    function spawnRowOfChickens(rowCount) { 
        let startX = (320 - (chickensPerRow * 35)) / 2; 
        for(let r = 0; r < rowCount; r++) { 
            for(let c = 0; c < chickensPerRow; c++) { 
                enemies.push({ 
                    x: startX + c * 35 + 15, 
                    y: -50 - (r * 35), 
                    originX: startX + c * 35 + 15, 
                    originY: 50 + (r * 35), 
                    size: 14, 
                    hp: 1, 
                    state: 'ENTER', 
                    timer: 0, 
                    vx: (Math.random() > 0.5 ? 1 : -1) * 1.5 * globalSpeedMult, 
                    vy: (Math.random() > 0.5 ? 1 : -1) * 1.5 * globalSpeedMult 
                }); 
            } 
        } 
    }

    function checkMilestone() { 
        if (score > 0 && score % 50000 === 0) { 
            gameMode = 'SUPER_WAVE'; 
            wavePhase = 1; 
            waveDelay = 60; 
            globalSpeedMult += 0.1; 
            nextMilestone = score + 500; 
        } 
        else if (score > 0 && score % 1000 === 0) { 
            gameMode = 'SWARM'; 
            wavePhase = 1; 
            waveDelay = 60; 
            nextMilestone = score + 500; 
        } 
        else if (score >= nextMilestone) { 
            gameMode = 'WAVE'; 
            wavePhase = 1; 
            waveDelay = 60; 
            nextMilestone = score + 500; 
        } 
    }

    function triggerHit() { 
        playSfx('boom'); 
        boom(player.x, player.y, '#3498db'); 
        player.hp--; 
        $('chicken-score').innerText = `Điểm: ${score} | ❤️ ${player.hp}`; 
        
        if(player.hp <= 0) { 
            isGO = true; 
            $('chicken-final-score').innerText = `Điểm: ${score}`; 
            $('chicken-go').style.display = 'flex'; 
        } 
    }

    function update() { 
        if(isGO) return; 
        frameCount++; 
        
        if(isDragging && frameCount % 8 === 0) { 
            bullets.push({ x: player.x, y: player.y - 16, speed: 12, hp: 3 }); 
            playSfx('shoot'); 
        } 
        
        for(let i = bullets.length - 1; i >= 0; i--) { 
            let b = bullets[i]; 
            b.y -= b.speed; 
            if(b.y < -20) { 
                bullets.splice(i, 1); 
                continue; 
            } 
            for(let j = enemies.length - 1; j >= 0; j--) { 
                let e = enemies[j]; 
                if(Math.sqrt((b.x - e.x) ** 2 + (b.y - e.y) ** 2) < e.size + 8) { 
                    boom(e.x, e.y); 
                    playSfx('eat'); 
                    e.hp--; 
                    b.hp--; 
                    if(e.hp <= 0) { 
                        enemies.splice(j, 1); 
                        score += 5; 
                        $('chicken-score').innerText = `Điểm: ${score} | ❤️ ${player.hp}`; 
                        checkMilestone(); 
                    } 
                    if(b.hp <= 0) { 
                        bullets.splice(i, 1); 
                        break; 
                    } 
                } 
            } 
        } 
        
        if(gameMode === 'NORMAL') { 
            if(frameCount % 50 === 0) {
                enemies.push({ x: Math.random() * 280 + 20, y: -20, originY: -20, size: 14, hp: 1, state: 'FALL', speed: 1.5 * globalSpeedMult }); 
            }
        } else { 
            if (enemies.length === 0) { 
                if (waveDelay > 0) {
                    waveDelay--; 
                } else { 
                    if (wavePhase <= (gameMode === 'SWARM' ? 1 : 3)) { 
                        spawnRowOfChickens(gameMode === 'SWARM' ? 3 : wavePhase); 
                        wavePhase++; 
                    } else {
                        gameMode = 'NORMAL'; 
                    }
                } 
            } 
        } 
        
        for(let j = enemies.length - 1; j >= 0; j--) { 
            let e = enemies[j];
            if(e.state === 'FALL') { 
                e.y += e.speed; 
                if(e.y > 680) { 
                    enemies.splice(j, 1); 
                    triggerHit(); 
                } 
            } 
            else if(e.state === 'ENTER') { 
                e.y += 3 * globalSpeedMult; 
                if (e.y >= e.originY) { 
                    e.y = e.originY; 
                    e.state = gameMode === 'SWARM' ? 'FREE' : (gameMode === 'SUPER_WAVE' ? 'SUPER_IDLE' : 'IDLE'); 
                    e.timer = 60 + Math.random() * 60; 
                } 
            } 
            else if(e.state === 'IDLE') { 
                e.timer--; 
                if(e.timer <= 0) { e.state = 'WARN'; e.timer = 40; playSfx('warn'); } 
            } 
            else if(e.state === 'WARN') { 
                e.timer--; 
                if(e.timer <= 0) e.state = 'DIVE'; 
            } 
            else if(e.state === 'DIVE') { 
                e.y += 6 * globalSpeedMult; 
                if(e.y > canvas.height) { e.y = canvas.height; e.state = 'RETREAT'; triggerHit(); if(isGO) return; } 
            } 
            else if(e.state === 'RETREAT') { 
                e.y -= 2 * globalSpeedMult; 
                if(e.y <= e.originY) { e.y = e.originY; e.state = 'IDLE'; e.timer = 120 + Math.random() * 100; } 
            } 
            else if(e.state === 'FREE') { 
                e.x += e.vx; 
                e.y += e.vy; 
                if(e.x < 20 || e.x > 300) e.vx *= -1; 
                if(e.y < 20 || e.y > 400) e.vy *= -1; 
                if(Math.random() < 0.005) enemyBullets.push({x: e.x, y: e.y + 14, speed: 4 * globalSpeedMult}); 
            } 
            else if(e.state === 'SUPER_IDLE') { 
                e.x += Math.sin(frameCount / 20 + j) * 2; 
                if(Math.random() < 0.005) enemyBullets.push({x: e.x, y: e.y + e.size, speed: 5 * globalSpeedMult}); 
                e.timer--; 
                if(e.timer <= 0) { e.state = 'WARN_SUPER'; e.timer = 40; playSfx('warn'); } 
            } 
            else if(e.state === 'WARN_SUPER') { 
                e.timer--; 
                if(e.timer <= 0) e.state = 'DIVE_SUPER'; 
            } 
            else if(e.state === 'DIVE_SUPER') { 
                e.y += 7 * globalSpeedMult; 
                if(e.y > canvas.height) { e.y = canvas.height; e.state = 'RETREAT_SUPER'; triggerHit(); if(isGO) return; } 
            } 
            else if(e.state === 'RETREAT_SUPER') { 
                e.y -= 3 * globalSpeedMult; 
                if(e.y <= e.originY) { e.y = e.originY; e.state = 'WAIT_SUPER'; e.timer = 60; } 
            } 
            else if(e.state === 'WAIT_SUPER') { 
                e.timer--; 
                if(e.timer <= 0) { e.state = 'SUPER_IDLE'; e.timer = 100 + Math.random() * 100; } 
            } 
            
            if(!isGO && Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2) < 25) { 
                enemies.splice(j, 1); 
                triggerHit(); 
            } 
        } 
        
        for(let k = enemyBullets.length - 1; k >= 0; k--) { 
            let eb = enemyBullets[k]; 
            eb.y += eb.speed; 
            if(eb.y > 690) { 
                enemyBullets.splice(k, 1); 
                continue; 
            } 
            if(Math.sqrt((eb.x - player.x) ** 2 + (eb.y - player.y) ** 2) < 15) { 
                enemyBullets.splice(k, 1); 
                triggerHit(); 
            } 
        } 
        
        particles.forEach((p, i) => { 
            p.x += p.vx; 
            p.y += p.vy; 
            p.life -= 0.05; 
            if(p.life <= 0) particles.splice(i, 1); 
        });
    }

    function draw() { 
        ctx.fillStyle = '#0a0508'; 
        ctx.fillRect(0, 0, 320, 680); 
        ctx.fillStyle = '#fff'; 
        
        for(let i = 0; i < 5; i++) {
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1); 
        }
        
        ctx.fillStyle = '#3498db'; 
        ctx.beginPath(); 
        ctx.moveTo(player.x, player.y - 16); 
        ctx.lineTo(player.x - 16, player.y + 16); 
        ctx.lineTo(player.x + 16, player.y + 16); 
        ctx.fill(); 
        
        bullets.forEach(b => { 
            ctx.fillStyle = b.hp === 3 ? '#f1c40f' : (b.hp === 2 ? '#e67e22' : '#e74c3c'); 
            ctx.fillRect(b.x - 3, b.y - 5, 6, 12); 
        }); 
        
        ctx.fillStyle = '#2ecc71'; 
        enemyBullets.forEach(eb => { 
            ctx.beginPath(); 
            ctx.arc(eb.x, eb.y, 4, 0, Math.PI * 2); 
            ctx.fill(); 
        }); 
        
        enemies.forEach(e => { 
            let color = ((e.state === 'WARN' || e.state === 'WARN_SUPER') && frameCount % 6 < 3) ? '#ffffff' : '#e74c3c'; 
            ctx.fillStyle = color; 
            ctx.beginPath(); 
            ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2); 
            ctx.fill(); 
            ctx.fillStyle = '#fff'; 
            ctx.fillRect(e.x - 6, e.y - 2, 4, 4); 
            ctx.fillRect(e.x + 2, e.y - 2, 4, 4); 
        }); 
        
        particles.forEach(p => { 
            ctx.fillStyle = p.color; 
            ctx.globalAlpha = Math.max(0, p.life); 
            ctx.beginPath(); 
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); 
            ctx.fill(); 
            ctx.globalAlpha = 1; 
        }); 
        
        if(gameMode !== 'NORMAL' && enemies.length > 0) { 
            ctx.fillStyle = "rgba(255,255,255,0.15)"; 
            ctx.font = "900 35px Arial"; 
            ctx.textAlign = "center"; 
            ctx.fillText(gameMode === 'WAVE' ? `LÀN SÓNG: ${wavePhase - 1}/3` : "QUẦN THẢO", canvas.width / 2, canvas.height / 2); 
        } 
    }

    return { 
        start: () => { 
            reset(); 
            cancelAnimationFrame(loopId); 
            function gameLoop() { 
                if(isGO) return; 
                update(); 
                draw(); 
                loopId = requestAnimationFrame(gameLoop); 
            }
            loopId = requestAnimationFrame(gameLoop); 
        }, 
        stop: () => { 
            isGO = true; 
            cancelAnimationFrame(loopId); 
        } 
    };
})();
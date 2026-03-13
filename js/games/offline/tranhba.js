// =========================================
// 9. LOGIC GAME TRANH BÁ (ĐUA XÌ)
// =========================================
const GameState = { 
    status: 'INIT', 
    gameMode: 'normal', 
    selectedCard: -1, 
    deck: [], 
    suits: ['♠', '♣', '♦', '♥'], 
    suitClasses: ['', '', 'suit-red', 'suit-red'], 
    playerNames: ['Bích', 'Chuồn', 'Rô', 'Cơ'], 
    positions: [6, 6, 6, 6], 
    colMapping: [0, 1, 2, 3], 
    drawHistory: [], 
    trapTargets: [], 
    trapRevealed: [false, false, false, false, false], 
    trapHistory: [] 
};

function buildAndShuffleDeck() { 
    let deck = []; 
    for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 13; j++) {
            deck.push(i); 
        }
    }
    for (let i = deck.length - 1; i > 0; i--) { 
        const j = Math.floor(Math.random() * (i + 1)); 
        [deck[i], deck[j]] = [deck[j], deck[i]]; 
    } 
    return deck; 
}

function navigateMenu(m, btn) { 
    initSound(); 
    GameState.gameMode = m; 
    GameState.selectedCard = -1; 
    
    if(btn) { 
        const drop = $('water-drop-fx');
        const rect = btn.getBoundingClientRect(); 
        drop.style.left = (rect.left + rect.width / 2) + 'px'; 
        drop.style.top = (rect.top + rect.height / 2) + 'px'; 
        drop.classList.add('water-drop-active'); 
    }
    
    setTimeout(() => { 
        const glow = $('glow-transition'); 
        glow.style.display = 'block'; 
        
        gsap.to(glow, { 
            opacity: 1, 
            duration: 0.3, 
            onComplete: () => { 
                document.querySelectorAll('.screen-container').forEach(el => el.style.display = 'none');
                
                if (m === 'tournament') { 
                    openModal('overlay-names'); 
                    gsap.set("#name-box input", { opacity: 0, x: -30 }); 
                    gsap.set("#btn-start-tour", { opacity: 0 }); 
                    gsap.to("#name-box input", { opacity: 1, x: 0, duration: 0.6, stagger: 0.25 }); 
                    gsap.to("#btn-start-tour", { opacity: 1, duration: 0.6, delay: 1.2 }); 
                } else if (m === 'normal') { 
                    $('menu-screen').style.display = 'flex'; 
                    openModal('overlay-card-select'); 
                    const cards = document.querySelectorAll('.selectable-card'); 
                    cards.forEach(c => { 
                        c.classList.remove('can-hover'); 
                        gsap.killTweensOf(c); 
                    }); 
                    setTimeout(() => { 
                        gsap.fromTo(cards, 
                            { opacity: 0, scale: 0, rotationY: 180 }, 
                            { opacity: 1, scale: 1, rotationY: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.2)", 
                            onComplete: () => { 
                                cards.forEach(c => { 
                                    gsap.set(c, {clearProps: "all"}); 
                                    c.classList.add('can-hover'); 
                                }); 
                            } 
                        }); 
                    }, 50); 
                } 
                gsap.to(glow, { opacity: 0, duration: 0.4, delay: 0.1, onComplete: () => glow.style.display = 'none' });
            }
        }); 
    }, 300); 
}

function selectCardToRace(idx, event) { 
    initSound(); 
    playSfx('click'); 
    GameState.selectedCard = idx; 
    
    const drop = $('water-drop-fx'); 
    drop.style.left = event.clientX + 'px'; 
    drop.style.top = event.clientY + 'px'; 
    drop.classList.remove('water-drop-active'); 
    void drop.offsetWidth; 
    drop.classList.add('water-drop-active');
    
    const selectedCardEl = event.currentTarget;
    const allCards = document.querySelectorAll('.selectable-card'); 
    
    allCards.forEach(c => { 
        c.style.animation = 'none'; 
        c.classList.remove('can-hover'); 
        if (c !== selectedCardEl) gsap.to(c, { opacity: 0, scale: 0.8, duration: 0.3 }); 
    });
    
    gsap.to(selectedCardEl, { opacity: 0, duration: 0.8, ease: "power1.inOut" }); 
    gsap.to(selectedCardEl, { 
        x: "random(-3, 3)", 
        y: "random(-3, 3)", 
        rotation: "random(-2, 2)", 
        duration: 0.08, 
        repeat: 9, 
        yoyo: true, 
        onComplete: () => { 
            const glow = $('glow-transition'); 
            glow.style.display = 'block'; 
            gsap.to(glow, { 
                opacity: 1, 
                duration: 0.3, 
                onComplete: () => { 
                    closeModal('overlay-card-select'); 
                    document.querySelectorAll('.screen-container').forEach(el => el.style.display = 'none'); 
                    $('game-screen').style.display = 'flex'; 
                    setTimeout(() => initGameRace(), 50); 
                    gsap.to(glow, { opacity: 0, duration: 0.4, delay: 0.1, onComplete: () => glow.style.display = 'none' }); 
                }
            }); 
        }
    });
}

function confirmPlayerNames() { 
    initSound(); 
    for(let i = 0; i < 4; i++) { 
        let v = $(`player-name-${i}`).value.trim(); 
        if(v) GameState.playerNames[i] = v; 
    } 
    
    closeModal('overlay-names'); 
    const glow = $('glow-transition'); 
    glow.style.display = 'block';
    
    gsap.to(glow, { 
        opacity: 1, 
        duration: 0.3, 
        onComplete: () => { 
            document.querySelectorAll('.screen-container').forEach(el => el.style.display = 'none'); 
            $('game-screen').style.display = 'flex'; 
            setTimeout(() => initGameRace(), 50); 
            gsap.to(glow, { opacity: 0, duration: 0.4, delay: 0.1, onComplete: () => glow.style.display = 'none' }); 
        }
    });
}

function getPercentageCoordinate(row, col) { 
    return { left: `${(col * 20) + 10}%`, top: `${(row * (100 / 7)) + (100 / 14)}%` }; 
}

function initGameRace() { 
    if(!isShuffleMode && !window.isUserPaused) playMasterMusic('game'); 
    
    GameState.positions = [6, 6, 6, 6]; 
    GameState.drawHistory = []; 
    GameState.trapRevealed = [false, false, false, false, false]; 
    GameState.trapHistory = []; 
    GameState.status = 'INIT'; 
    gsap.killTweensOf('.card-actor, .trap-actor');
    
    const grid = $('visual-grid'); 
    grid.innerHTML = ''; 
    for(let i = 0; i < 7; i++) { 
        let r = document.createElement('div'); 
        r.className = 'visual-row'; 
        for(let j = 0; j < 5; j++) { 
            let c = document.createElement('div'); 
            c.className = (j == 4) ? 'visual-cell visual-trap-cell' : 'visual-cell'; 
            r.appendChild(c); 
        } 
        grid.appendChild(r); 
    } 
    
    const lay = $('entity-layer'); 
    lay.innerHTML = ''; 
    
    GameState.deck = buildAndShuffleDeck(); 
    GameState.trapTargets = []; 
    for(let i = 0; i < 5; i++) {
        GameState.trapTargets.push(GameState.deck.pop()); 
    }
    
    GameState.colMapping = [0, 1, 2, 3]; 
    for (let i = 3; i > 0; i--) { 
        let j = Math.floor(Math.random() * (i + 1)); 
        [GameState.colMapping[i], GameState.colMapping[j]] = [GameState.colMapping[j], GameState.colMapping[i]]; 
    } 
    
    GameState.status = 'BUSY'; 
    $('system-status-msg').innerText = "ĐANG ĐIỀU BINH KHIỂN TƯỚNG..."; 
    $('system-status-msg').style.color = "var(--game-text-color)"; 
    
    let shuffleCards = [];
    let deckWrapper = $('deck-wrapper-3d');
    let deckRect = deckWrapper.getBoundingClientRect(); 
    deckWrapper.style.opacity = '0';
    
    for(let i = 0; i < 5; i++) { 
        let sc = document.createElement('div'); 
        sc.className = 'deck-card-face face-back'; 
        sc.style.width = 'var(--card-width)'; 
        sc.style.height = 'var(--card-height)'; 
        sc.style.position = 'fixed'; 
        sc.style.top = '50%'; 
        sc.style.left = '50%'; 
        sc.style.transform = 'translate(-50%, -50%)'; 
        sc.style.zIndex = 10000 + i; 
        document.body.appendChild(sc); 
        shuffleCards.push(sc); 
    } 
    
    let shuffleTl = gsap.timeline({ 
        onComplete: () => { 
            $('system-status-msg').innerText = "XUẤT QUÂN..."; 
            const dealTl = gsap.timeline({ 
                onComplete: () => { 
                    GameState.status = 'IDLE'; 
                    $('system-status-msg').innerText = "THÁNH CHỈ: HÃY RÚT THẺ BÀI"; 
                } 
            }); 
            
            for(let i = 0; i < 5; i++) { 
                let t = document.createElement('div'); 
                t.id = `trap-entity-${i}`; 
                t.className = 'trap-actor'; 
                t.innerText = '?'; 
                lay.appendChild(t); 
                let targetPos = getPercentageCoordinate(5 - i, 4); 
                gsap.set(t, { left: "50%", top: "120%", xPercent: -50, yPercent: -50, scale: 0.5 }); 
                dealTl.to(t, { left: targetPos.left, top: targetPos.top, scale: 1, duration: 0.3, ease: "back.out(1.2)", onStart: () => playSfx('deal') }, "-=0.15"); 
            } 
            
            for(let i = 0; i < 4; i++) { 
                let a = document.createElement('div'); 
                a.id = `ace-entity-${i}`; 
                a.className = `card-actor ${GameState.suitClasses[i]}`; 
                a.style.backgroundImage = `url('${playerCardImages[i]}')`; 
                a.innerHTML = `<div class="card-name-tag" style="color:var(--game-text-color)">${GameState.playerNames[i]}</div>`; 
                lay.appendChild(a); 
                let targetPos = getPercentageCoordinate(6, GameState.colMapping[i]); 
                gsap.set(a, { left: "50%", top: "120%", xPercent: -50, yPercent: -50, scale: 0.5 }); 
                dealTl.to(a, { left: targetPos.left, top: targetPos.top, scale: 1, duration: 0.3, ease: "back.out(1.2)", onStart: () => playSfx('deal') }, "-=0.15"); 
            } 
        }
    }); 
    
    for(let step = 0; step < 3; step++) {
        shuffleTl.to(shuffleCards, { 
            x: (index) => (index % 2 === 0 ? -40 : 40) + (Math.random() * 15), 
            y: () => (Math.random() * 20) - 10, 
            rotation: () => (Math.random() * 30) - 15, 
            duration: 0.2, 
            onStart: () => playSfx('deal') 
        }).to(shuffleCards, { x: 0, y: 0, rotation: 0, duration: 0.2 });
    }
    
    shuffleTl.to(shuffleCards, { 
        left: (deckRect.left + deckRect.width / 2) + 'px', 
        top: (deckRect.top + deckRect.height / 2) + 'px', 
        scale: deckRect.width / 45, 
        rotation: 0, 
        duration: 0.5, 
        ease: "power2.inOut", 
        onStart: () => playSfx('swoosh') 
    }).to(shuffleCards, { 
        opacity: 0, 
        duration: 0.15, 
        onStart: () => { deckWrapper.style.opacity = '1'; }, 
        onComplete: () => { shuffleCards.forEach(c => c.remove()); } 
    });
} 

function executeCardDraw() { 
    if(GameState.status !== 'IDLE') return; 
    
    GameState.status = 'BUSY'; 
    initSound(); 
    playSfx('flip');
    
    if (GameState.deck.length === 0) {
        GameState.deck = buildAndShuffleDeck(); 
    }
    
    const idx = GameState.deck.pop(); 
    GameState.drawHistory.push(idx); 
    
    let drawnFace = $('drawn-card-result'); 
    drawnFace.style.backgroundImage = `url('${playerCardImages[idx]}')`; 
    drawnFace.innerText = ''; 
    drawnFace.className = `deck-card-face face-front ${GameState.suitClasses[idx]}`; 
    
    gsap.to('#deck-rotator-node', { 
        rotationY: 180, 
        duration: 0.4, 
        ease: "power1.inOut", 
        onComplete: () => { 
            GameState.positions[idx]--; 
            let targetPos = getPercentageCoordinate(GameState.positions[idx], GameState.colMapping[idx]); 
            playSfx('move'); 
            gsap.to(`#ace-entity-${idx}`, { 
                left: targetPos.left, 
                top: targetPos.top, 
                duration: 0.4, 
                onComplete: () => {
                    gsap.to('#deck-rotator-node', { 
                        rotationY: 0, 
                        duration: 0.2, 
                        onComplete: () => setTimeout(() => checkRules(idx), 100) 
                    });
                }
            }); 
        }
    });
}

function checkRules(idx) { 
    const h = GameState.drawHistory;
    const len = h.length; 
    let pSteps = 0, pType = 0; 
    
    if(len >= 3 && h[len-1] === idx && h[len-2] === idx && h[len-3] === idx) { 
        pSteps = 2; 
        pType = 3; 
    } 
    else if(len >= 2 && h[len-1] === idx && h[len-2] === idx) { 
        let prevPairIdx = -1; 
        for(let i = len - 3; i >= 1; i--) { 
            if(h[i] === idx && h[i-1] === idx) { 
                prevPairIdx = i - 1; 
                break; 
            } 
        } 
        if(prevPairIdx !== -1 && (len - prevPairIdx - 4) < 4) { 
            pSteps = 1; 
            pType = 2; 
        } 
    } 
    
    if(pSteps > 0) { 
        GameState.status = 'PENALTY'; 
        playSfx('error'); 
        $('system-status-msg').innerText = (pType === 3) ? "PHẠM QUÂN LỆNH: LUI BÌNH 2 BƯỚC" : "KẾ SÁCH THẤT BẠI: LUI BÌNH 1 BƯỚC"; 
        $('system-status-msg').style.color = "#ff4757";
        
        const pCard = $(`ace-entity-${idx}`); 
        pCard.style.zIndex = "1000"; 
        pCard.style.cursor = "pointer"; 
        pCard.style.pointerEvents = "auto";
        
        let pCardFlash = gsap.to(pCard, { boxShadow: "0 0 25px var(--game-border-color)", borderColor: "#ffffff", duration: 0.4, yoyo: true, repeat: -1 });
        let deckFlash = gsap.to($('deck-wrapper-3d'), { boxShadow: "0 0 40px #ff0000", duration: 0.3, yoyo: true, repeat: -1 });
        
        pCard.onclick = function() { 
            this.onclick = null; 
            this.style.zIndex = "50"; 
            this.style.cursor = "default"; 
            this.style.pointerEvents = "none"; 
            pCardFlash.kill(); 
            deckFlash.kill(); 
            gsap.set(pCard, { clearProps: "boxShadow,borderColor" }); 
            gsap.set($('deck-wrapper-3d'), { clearProps: "boxShadow" }); 
            playSfx('error'); 
            
            if(pType === 3) { 
                h[len-1] = -1; h[len-2] = -1; h[len-3] = -1; 
            } else if(pType === 2) { 
                h[len-1] = -1; h[len-2] = -1; 
            } 
            
            GameState.positions[idx] = Math.min(6, GameState.positions[idx] + pSteps); 
            let targetPos = getPercentageCoordinate(GameState.positions[idx], GameState.colMapping[idx]); 
            gsap.to(pCard, { 
                left: targetPos.left, 
                top: targetPos.top, 
                duration: 0.5, 
                onComplete: () => checkTraps(idx) 
            }); 
        };
    } else {
        checkTraps(idx); 
    }
}

function checkTraps(idx) { 
    if(GameState.positions[idx] <= 0){ 
        triggerVictory(idx); 
        return; 
    } 
    
    for(let i = 0; i < 5; i++) { 
        if(GameState.positions.every(pos => pos <= (5 - i)) && !GameState.trapRevealed[i]) { 
            GameState.status = 'TRAP'; 
            $('system-status-msg').innerText = "CÓ BIẾN! MỞ BẪY ĐI CHƯ VỊ"; 
            $('system-status-msg').style.color = "var(--game-text-color)"; 
            
            const trapElement = $(`trap-entity-${i}`); 
            trapElement.classList.add('alert-trap'); 
            playSfx('ting'); 
            
            let trapFlash = gsap.to(trapElement, { 
                boxShadow: "0 0 25px var(--game-border-color)", 
                borderColor: "#ffffff", 
                duration: 0.4, 
                yoyo: true, 
                repeat: -1, 
                onRepeat: () => playSfx('ting') 
            });
            
            trapElement.onclick = function() { 
                this.onclick = null; 
                this.classList.remove('alert-trap'); 
                trapFlash.kill(); 
                gsap.set(trapElement, { clearProps: "boxShadow,borderColor" }); 
                playSfx('flip'); 
                
                const s = GameState.trapTargets[i]; 
                GameState.trapRevealed[i] = true; 
                GameState.trapHistory.push(s); 
                
                gsap.to(this, { 
                    rotationY: 90, 
                    duration: 0.15, 
                    onComplete: () => { 
                        this.className = `card-actor ${GameState.suitClasses[s]}`; 
                        this.style.backgroundImage = `url('${trapCardImages[s]}')`; 
                        this.innerText = ''; 
                        gsap.to(this, { rotationY: 0, duration: 0.15 }); 
                    }
                }); 
                
                let count = GameState.trapHistory.filter(x => x === s).length;
                let move = (count >= 4) ? 1 : (count === 3 ? 2 : -1);
                let msg = ""; 
                
                if(move === 1) msg = "ĐƯỢC TRỜI ĐỘ: TIẾN 1 BƯỚC"; 
                else if(move === 2) msg = "CHÂN MỆNH THIÊN TỬ: TIẾN 2 BƯỚC"; 
                else msg = "TRÚNG PHỤC KÍCH: LUI BÌNH 1 BƯỚC"; 
                
                $('system-status-msg').innerText = msg; 
                $('system-status-msg').style.color = move > 0 ? "#2ecc71" : "#ff4757"; 
                
                setTimeout(() => { 
                    if(move < 0) playSfx('error'); 
                    else playSfx('move'); 
                    
                    GameState.positions[s] = Math.max(0, Math.min(6, GameState.positions[s] - move)); 
                    let targetPos = getPercentageCoordinate(GameState.positions[s], GameState.colMapping[s]); 
                    gsap.to(`#ace-entity-${s}`, { 
                        left: targetPos.left, 
                        top: targetPos.top, 
                        duration: 0.6, 
                        onComplete: () => checkTraps(idx) 
                    }); 
                }, 800); 
            }; 
            return; 
        } 
    } 
    
    GameState.status = 'IDLE'; 
    $('system-status-msg').innerText = "THÁNH CHỈ: HÃY RÚT THẺ BÀI"; 
    $('system-status-msg').style.color = "var(--game-text-color)";
}

function triggerVictory(idx) { 
    GameState.status = 'WIN'; 
    $('system-status-msg').innerText = "ĐÃ LÊN NGÔI CHÍ TÔN!";
    
    let isPlayer = (GameState.gameMode === 'normal' && GameState.selectedCard === idx);
    let isWin = (GameState.gameMode === 'tournament') || isPlayer; 
    window.currentWinStatus = isWin; 
    
    let headlineNode = $('victory-headline'); 
    
    if (isWin) { 
        playSfx('win'); 
        headlineNode.innerText = "CHIẾN THẮNG!"; 
        headlineNode.style.color = "#ffd700"; 
        headlineNode.style.textShadow = "0 0 30px #ffd700"; 
        confetti({ particleCount: 300, spread: 80, origin: { y: 0.6 } }); 
    } else { 
        playSfx('lose'); 
        headlineNode.innerText = "THẤT BẠI RỒI!"; 
        headlineNode.style.color = "#e74c3c"; 
        headlineNode.style.textShadow = "0 0 30px #e74c3c"; 
    } 
    
    setTimeout(() => { 
        openModal('overlay-victory'); 
        $('victory-player-name').innerText = isWin ? "VẠN TUẾ, VẠN TUẾ, VẠN VẠN TUẾ!" : "THẮNG BẠI LÀ CHUYỆN THƯỜNG TÌNH CỦA BINH GIA!"; 
        $('victory-card-podium').innerHTML = `<div class="card-actor ${GameState.suitClasses[idx]} winner-card-fx" style="position:relative; transform:scale(2); margin:0; cursor:default; background-image: url('${playerCardImages[idx]}');"></div>`; 
    }, 1000);
}

function playAgain() { 
    closeModal('overlay-victory'); 
    $('system-status-msg').innerText = "THÁNH CHỈ: HÃY RÚT THẺ BÀI"; 
    $('system-status-msg').style.color = "var(--game-text-color)"; 
    setTimeout(() => initGameRace(), 50); 
}
// =========================================
// LOGIC GAME MA SÓI (ONLINE) - FIX CRASH CHUẨN
// =========================================

let currentWwRoomId = null;
let currentWwPlayerId = null;
let isWwHost = false;
let wwMode = "basic";
let wwVisibility = "public"; 
let wwPassword = ""; 
let wwRoomName = "";
let isReady = false; 
let myRoleInfo = "";
let wwTimerInterval;
let botInterval;
let myHasRevealed = false;

// --- UI FLOW ---
function openWwMenu() {
    playSfx('click'); closeModal('overlay-online-games'); openModal('overlay-ww-menu');
}

function showWwCreate() {
    playSfx('click'); closeModal('overlay-ww-menu'); openModal('overlay-ww-create');
    const rn = document.getElementById('ww-room-name-input');
    if(rn) rn.value = ""; 
    uiSelectWwMode('basic'); 
    uiBackToStep1(); 
}

function showWwJoin() {
    playSfx('click'); closeModal('overlay-ww-menu'); openModal('overlay-ww-join');
    loadPublicRooms(); 
}

function closeWwJoinModal() {
    playSfx('click');
    database.ref('rooms').off('value'); 
    closeModal('overlay-ww-join'); 
    openModal('overlay-ww-menu');
}

function uiSelectWwMode(mode) {
    wwMode = mode;
    const b = document.getElementById('btn-mode-basic');
    const e = document.getElementById('btn-mode-extend');
    if(b) b.classList.remove('active');
    if(e) e.classList.remove('active');
    const s = document.getElementById(`btn-mode-${mode}`);
    if(s) s.classList.add('active');
    
    const btnConfirm = document.getElementById('btn-confirm-mode');
    if(btnConfirm) {
        btnConfirm.disabled = false;
        btnConfirm.className = "btn-core ui-btn btn-unlocked";
    }
}

function uiGoToStep2() {
    playSfx('click');
    const s1 = document.getElementById('ww-step-1-mode');
    const s2 = document.getElementById('ww-step-2-visibility');
    if(s1) s1.style.display = 'none';
    if(s2) s2.style.display = 'block';
    uiSelectVisibility('public'); 
}

function uiBackToStep1() {
    playSfx('click');
    const s1 = document.getElementById('ww-step-1-mode');
    const s2 = document.getElementById('ww-step-2-visibility');
    if(s2) s2.style.display = 'none';
    if(s1) s1.style.display = 'block';
}

function uiSelectVisibility(vis) {
    wwVisibility = vis;
    const pub = document.getElementById('btn-vis-public');
    const pri = document.getElementById('btn-vis-private');
    if(pub) pub.classList.remove('active');
    if(pri) pri.classList.remove('active');
    
    const sel = document.getElementById(`btn-vis-${vis}`);
    if(sel) sel.classList.add('active');
    
    const pc = document.getElementById('ww-private-pass-container');
    if(pc) pc.style.display = (vis === 'private') ? 'block' : 'none';
    
    const btnFinal = document.getElementById('btn-final-create');
    if(btnFinal) {
        btnFinal.disabled = false;
        btnFinal.className = "btn-core ui-btn btn-unlocked";
    }
}

// --- TẠO PHÒNG CÓ TÊN (KHÔNG CHỜ DATABASE -> KHÔNG CRASH) ---
function executeCreateRoom() {
    if (wwVisibility === 'private') {
        const pwdInput = document.getElementById('ww-create-password');
        wwPassword = pwdInput ? pwdInput.value.trim() : "";
        if (!wwPassword) { customAlert("THÔNG BÁO", "Vui lòng đặt mật lệnh!", "OK"); return; }
    } else { 
        wwPassword = ""; 
    }

    const nameInput = document.getElementById('ww-room-name-input');
    let customName = nameInput ? nameInput.value.trim() : "";
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Tự động cấp tên nếu để trống (Bỏ qua bước gọi database gây kẹt mạng)
    if (!customName) {
        customName = "Phòng " + randomCode.substring(0, 3);
    }
    
    wwRoomName = customName;
    const rId = "masoi:" + randomCode; 
    
    joinRoomProcess(rId, true);
}

// --- TÌM PHÒNG CÔNG KHAI ---
function loadPublicRooms() {
    const listDiv = document.getElementById('ww-public-rooms-list');
    if(!listDiv) return;
    listDiv.innerHTML = '<p style="color: #aaa; text-align: center; font-size: 12px; margin-top:10px;">Đang dò tìm vượng khí...</p>';
    
    database.ref('rooms').on('value', (snap) => {
        const rooms = snap.val() || {};
        let htmlStr = '';
        let count = 0;
        
        for (let rId in rooms) {
            const r = rooms[rId];
            if (rId.startsWith('masoi:') && r.visibility === 'public' && r.status === 'waiting') {
                count++;
                let pCount = r.players ? Object.keys(r.players).length : 0;
                let rName = r.roomName || "Sảnh " + rId.split(':')[1];
                let shortId = rId.split(':')[1] || rId;
                let modeName = r.mode === 'basic' ? 'Cơ Bản' : 'Mở Rộng';
                
                htmlStr += `
                    <div style="background: rgba(0,0,0,0.6); border: 1px solid #d4af37; padding: 10px; border-radius: 5px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="color: #fff; font-weight: bold; font-size: 14px;">${rName}</span><br>
                            <span style="font-size: 11px; color: #aaa;">Mã: ${shortId} | Luật: ${modeName} | Người: ${pCount}</span>
                        </div>
                        <button class="btn-core ui-btn" style="width: 70px; height: 32px; font-size: 12px; margin: 0; box-shadow: none;" onclick="joinRoomProcess('${rId}', false)">VÀO</button>
                    </div>
                `;
            }
        }
        listDiv.innerHTML = count > 0 ? htmlStr : '<p style="color: #e74c3c; text-align: center; font-size: 12px; margin-top:10px;">Hiện không có sảnh công khai nào đang mở!</p>';
    });
}

// --- VÀO PHÒNG BẰNG MÃ (CÔNG KHAI) ---
function executeJoinPublicCode() {
    let inputVal = document.getElementById('join-public-id').value.trim();
    if(!inputVal) { customAlert("THÔNG BÁO", "Vui lòng nhập mã phòng!", "OK"); return; }
    
    let cleanCode = inputVal.replace("masoi:", "");
    let rId = "masoi:" + cleanCode; 

    database.ref(`rooms/${rId}`).once('value', (snap) => {
        const data = snap.val();
        if (data && data.status === 'waiting') {
            if (data.visibility === 'private') {
                customAlert("TỪ CHỐI", "Đây là phòng Riêng Tư, vui lòng qua mục 'Đến Phòng Riêng Tư' để nhập mật lệnh!", "ĐÃ HIỂU");
            } else {
                closeModal('overlay-ww-join-code');
                joinRoomProcess(rId, false);
            }
        } else {
            customAlert("THÔNG BÁO", "Phòng không tồn tại hoặc đã vào game!", "OK");
        }
    });
}

// --- VÀO PHÒNG BẰNG MÃ VÀ PASS (RIÊNG TƯ) ---
function executeJoinPrivate() {
    let inputId = document.getElementById('join-private-id').value.trim();
    let inputPass = document.getElementById('join-private-code').value.trim();
    
    if(!inputId || !inputPass) { 
        customAlert("THÔNG BÁO", "Vui lòng nhập đủ Mã phòng và Mật lệnh!", "OK"); 
        return; 
    }
    
    let cleanCode = inputId.replace("masoi:", "");
    let rId = "masoi:" + cleanCode;
    
    database.ref(`rooms/${rId}`).once('value', (snap) => {
        const data = snap.val();
        if (data && data.visibility === 'private' && data.status === 'waiting') {
            if (data.password === inputPass) {
                closeModal('overlay-ww-private-join');
                joinRoomProcess(rId, false);
            } else {
                customAlert("SAI MẬT LỆNH", "Mật lệnh phòng không đúng!", "THỬ LẠI");
            }
        } else {
            customAlert("THÔNG BÁO", "Mã phòng không tồn tại, hoặc phòng đang chơi, hoặc đây không phải phòng riêng tư!", "OK");
        }
    });
}

// --- LOGIC XỬ LÝ VÀO SẢNH ---
function joinRoomProcess(rId, forceCreate) {
    playSfx('swoosh'); currentWwRoomId = rId; currentWwPlayerId = "player_" + Date.now(); 
    const roomRef = database.ref(`rooms/${currentWwRoomId}`); 
    
    if (forceCreate) {
        isWwHost = true; 
        roomRef.set({ 
            status: 'waiting', mode: wwMode, visibility: wwVisibility, password: wwPassword, roomName: wwRoomName, createdAt: firebase.database.ServerValue.TIMESTAMP 
        }).then(() => {
            finalizeJoinRoomUI();
        }); 
    } else {
        roomRef.once('value', (snapshot) => { 
            const data = snapshot.val(); 
            if (!data) { customAlert("LỖI", "Phòng này không tồn tại!", "ĐÃ HIỂU"); return; }
            if (data.status === 'playing') { customAlert("LỖI", "Phòng này đang chơi mất rồi!", "ĐÃ HIỂU"); return; }
            isWwHost = false; wwMode = data.mode || "basic"; wwPassword = data.password || "";
            finalizeJoinRoomUI(); 
        });
    }
}

function finalizeJoinRoomUI() {
    database.ref('rooms').off('value'); 
    closeModal('overlay-ww-create'); closeModal('overlay-ww-join'); openModal('overlay-werewolf-lobby'); 
    
    const roomIdUI = document.getElementById('ww-display-room-id');
    if(roomIdUI) roomIdUI.innerText = currentWwRoomId.split(':')[1] || currentWwRoomId;
    
    const modeUI = document.getElementById('ww-display-mode');
    if(modeUI) modeUI.innerText = wwMode === 'basic' ? "CƠ BẢN" : "MỞ RỘNG";
    
    const passUI = document.getElementById('ww-display-pass');
    if (passUI) {
        if (wwPassword) {
            passUI.style.display = 'block';
            passUI.innerText = "Mật lệnh: " + "*".repeat(wwPassword.length);
        } else {
            passUI.style.display = 'none';
        }
    }
    
    const btnStart = document.getElementById('btn-start-ww-game');
    if(btnStart) btnStart.style.display = isWwHost ? 'block' : 'none'; 
    
    const btnReady = document.getElementById('btn-ready-ww');
    if(btnReady) {
        btnReady.style.display = isWwHost ? 'none' : 'block'; 
        isReady = false;
        btnReady.innerText = "CHƯA SẴN SÀNG"; btnReady.style.background = "#f39c12";
    }
    
    let pName = typeof onlinePlayerName !== 'undefined' && onlinePlayerName !== "" ? onlinePlayerName : "Khách";
    const playerRef = database.ref(`rooms/${currentWwRoomId}/players/${currentWwPlayerId}`);
    playerRef.set({ name: pName, isHost: isWwHost, role: '', isReady: isWwHost, hasRevealed: false, status: 'online' }); 
    
    database.ref('.info/connected').on('value', (snap) => {
        if (snap.val() === true && currentWwRoomId) {
            playerRef.onDisconnect().remove(); 
        }
    });
    setupLobbyListeners(); 
}

function setupLobbyListeners() { 
    database.ref(`rooms/${currentWwRoomId}`).on('value', (snap) => {
        if (!snap.exists() && currentWwRoomId) {
            customAlert("THÔNG BÁO", "Sảnh đã bị giải tán!", "ĐÃ RÕ"); leaveWerewolfRoom(true); return;
        }
        const data = snap.val();
        if (data && data.status === 'playing' && typeof transitionToGamePhase === 'function') {
            transitionToGamePhase(data.phase, data.dayCount, data.timerEnd);
        }
    });

    database.ref(`rooms/${currentWwRoomId}/players`).on('value', (snapshot) => { 
        if (!snapshot.exists()) return; 

        const players = snapshot.val() || {}; 
        const listContainer = document.getElementById('ww-player-list'); 
        if(!listContainer) return;
        listContainer.innerHTML = ''; 
        
        const lobbyOverlay = document.getElementById('overlay-werewolf-lobby');
        if (currentWwPlayerId && !players[currentWwPlayerId] && lobbyOverlay && lobbyOverlay.style.display === 'flex') {
            customAlert("BỊ ĐUỔI", "Bạn đã bị Chủ phòng đuổi ra ngoài!", "ĐÃ RÕ");
            leaveWerewolfRoom(true); return;
        }

        let allReady = true;

        for (let pid in players) { 
            const p = players[pid]; 
            const hostLabel = p.isHost ? '<span style="color:#d4af37;">(Trưởng phòng)</span>' : '';
            const statusLabel = p.status === 'offline' ? '<span style="color:#e74c3c; margin-left:5px;">[Mất Kết Nối]</span>' : '';
            const readyLabel = (!p.isHost && p.isReady) ? '<span style="color:#2ecc71; margin-left:5px;">[Đã Sẵn Sàng]</span>' : '';
            const readyMark = p.hasRevealed ? '<span style="color:#2ecc71; margin-left:5px;">✔ Đã xem bài</span>' : '';
            
            let kickBtn = '';
            if (isWwHost && pid !== currentWwPlayerId) {
                kickBtn = `<button style="background:#e74c3c; color:#fff; border:none; padding: 4px 8px; border-radius:4px; cursor:pointer; font-size:10px; font-weight:bold; box-shadow: 0 2px 0 #c0392b;" onclick="kickPlayer('${pid}')">KICK</button>`;
            }

            listContainer.innerHTML += `
                <div class="player-item">
                    <div style="display:flex; align-items:center;">
                        <div class="player-status-dot" style="background:${p.status === 'offline' ? '#e74c3c' : '#2ecc71'}; box-shadow: 0 0 5px ${p.status === 'offline' ? '#e74c3c' : '#2ecc71'};"></div>
                        <span>${p.name} ${hostLabel} ${statusLabel} ${readyLabel} ${readyMark}</span>
                    </div>
                    ${kickBtn}
                </div>`; 
            
            if (!p.isHost && !p.isReady) allReady = false;
        } 
        
        const startBtn = document.getElementById('btn-start-ww-game');
        if (isWwHost && startBtn) {
            if (allReady) {
                startBtn.disabled = false; startBtn.className = "btn-core ui-btn btn-unlocked"; startBtn.innerText = "BẮT ĐẦU TRÒ CHƠI";
            } else {
                startBtn.disabled = true; startBtn.className = "btn-core ui-btn btn-locked"; startBtn.innerText = "BẮT ĐẦU (CHỜ SẴN SÀNG)";
            }
        }
    }); 
    
    const chatBox = document.getElementById('ww-chat-box');
    if(chatBox) {
        chatBox.innerHTML = '';
        database.ref(`rooms/${currentWwRoomId}/chat`).on('child_added', (snapshot) => { 
            const msg = snapshot.val(); 
            chatBox.innerHTML += `<div class="chat-msg"><span class="sender">[${msg.sender}]:</span> <span style="color:#fff8dc;">${msg.text}</span></div>`; 
            chatBox.scrollTop = chatBox.scrollHeight; 
        }); 
    }
}

function copyRoomId() {
    let copyText = "Mã phòng: " + (currentWwRoomId ? currentWwRoomId.split(':')[1] : "");
    let successMsg = "Bạn đã sao chép thành công ID phòng";

    if (wwVisibility === 'private' && wwPassword) {
        copyText += " | Mật lệnh: " + wwPassword;
        successMsg = "Bạn đã sao chép thành công ID phòng và Password";
    }

    navigator.clipboard.writeText(copyText).then(() => {
        const desc = document.getElementById('copy-success-desc');
        if(desc) {
            desc.innerText = successMsg;
            openModal('overlay-copy-success');
        }
    });
}

function toggleReadyState() {
    if (isWwHost || !currentWwRoomId) return;
    isReady = !isReady;
    database.ref(`rooms/${currentWwRoomId}/players/${currentWwPlayerId}`).update({ isReady: isReady });
    const btn = document.getElementById('btn-ready-ww');
    if(btn) {
        btn.innerText = isReady ? "ĐÃ SẴN SÀNG" : "CHƯA SẴN SÀNG";
        btn.style.background = isReady ? "#2ecc71" : "#f39c12";
    }
}

function kickPlayer(pId) {
    if (!isWwHost || !currentWwRoomId) return;
    if(confirm("Bạn có chắc chắn muốn đuổi người này ra khỏi sảnh?")) {
        database.ref(`rooms/${currentWwRoomId}/players/${pId}`).remove();
    }
}

function leaveWerewolfRoom(forceKick = false) { 
    playSfx('click');
    
    if (currentWwRoomId) {
        database.ref(`rooms/${currentWwRoomId}`).off();
        database.ref(`rooms/${currentWwRoomId}/players`).off();
    }

    if (currentWwRoomId && currentWwPlayerId && !forceKick) { 
        if (isWwHost) {
            database.ref(`rooms/${currentWwRoomId}`).remove();
        } else {
            database.ref(`rooms/${currentWwRoomId}/players/${currentWwPlayerId}`).remove(); 
        }
    } 
    
    database.ref('rooms').off('value'); 
    clearInterval(wwTimerInterval); 
    clearInterval(botInterval);
    
    currentWwRoomId = null; currentWwPlayerId = null; isWwHost = false; myHasRevealed = false;
    
    closeModal('overlay-werewolf-lobby'); 
    const gameScrn = document.getElementById('ww-gameplay-screen');
    if(gameScrn) gameScrn.style.display = 'none'; 
    openModal('overlay-online-games'); 
}

// =========================================
// 4. BẮT ĐẦU GAME VÀ LẬT BÀI
// =========================================
function startWerewolfGame() { 
    if (!isWwHost) return; 
    playSfx('warn'); 
    const playersRef = database.ref(`rooms/${currentWwRoomId}/players`);
    playersRef.once('value', (snapshot) => {
        const players = snapshot.val(); 
        if(!players) return;
        
        let pIds = Object.keys(players);
        let numPlayers = pIds.length;
        
        let rolesPool = wwMode === 'basic' ? ["MA SÓI", "TIÊN TRI", "BẢO VỆ"] : ["MA SÓI", "TIÊN TRI", "BẢO VỆ", "PHÙ THỦY", "THỢ SĂN", "KẺ NGỐC"];
        while(rolesPool.length < numPlayers) { rolesPool.push("DÂN LÀNG"); }
        rolesPool = rolesPool.slice(0, numPlayers);
        
        for (let i = rolesPool.length - 1; i > 0; i--) { 
            const j = Math.floor(Math.random() * (i + 1)); 
            [rolesPool[i], rolesPool[j]] = [rolesPool[j], rolesPool[i]]; 
        }
        
        let updates = {}; 
        pIds.forEach((pid, index) => { 
            updates[`players/${pid}/role`] = rolesPool[index]; 
            updates[`players/${pid}/isReady`] = false; 
            updates[`players/${pid}/hasRevealed`] = false; 
        });
        
        updates['status'] = 'playing'; updates['phase'] = 'revealing'; updates['dayCount'] = 0; 
        database.ref(`rooms/${currentWwRoomId}`).update(updates);
        botInterval = setInterval(() => { checkBotPhaseSwitch(); }, 2000);
    });
}

function checkBotPhaseSwitch() {
    if(!isWwHost || !currentWwRoomId) return;
    database.ref(`rooms/${currentWwRoomId}`).once('value', snap => {
        const data = snap.val(); 
        if(!data || data.status !== 'playing') return;
        
        let allRevealed = true; let allReady = true; let hasOffline = false;
        const pData = data.players || {};
        
        for(let pid in pData) { 
            if(pData[pid].status === 'offline') hasOffline = true;
            if(!pData[pid].hasRevealed) allRevealed = false; 
            if(!pData[pid].isReady) allReady = false; 
        }
        
        const sysMsg = document.getElementById('system-status-msg');
        if (hasOffline) { 
            if(sysMsg) sysMsg.innerText = "TẠM DỪNG: CÓ NGƯỜI CHƠI MẤT KẾT NỐI!"; 
            return; 
        } else { 
            if(sysMsg) sysMsg.innerText = ""; 
        }

        if (data.phase === 'revealing' && allRevealed) {
            let offset = wwMode === 'basic' ? 150000 : 60000;
            database.ref(`rooms/${currentWwRoomId}`).update({ phase: 'night', dayCount: 1, timerEnd: Date.now() + offset });
            return;
        }
        
        if (data.phase !== 'revealing') {
            let timeLeft = data.timerEnd - Date.now();
            if (allReady || timeLeft <= 0) {
                let nextPhase = data.phase === 'night' ? 'day' : 'night';
                let nextDayCount = data.phase === 'night' ? data.dayCount : data.dayCount + 1;
                let offset = nextPhase === 'night' ? (wwMode === 'basic' ? 150000 : 60000) : 300000;
                
                let updates = { phase: nextPhase, dayCount: nextDayCount, timerEnd: Date.now() + offset };
                for(let pid in pData) { updates[`players/${pid}/isReady`] = false; }
                database.ref(`rooms/${currentWwRoomId}`).update(updates);
            }
        }
    });
}

function transitionToGamePhase(phase, dayCount, timerEnd) {
    closeModal('overlay-werewolf-lobby'); 
    const gameScrn = document.getElementById('ww-gameplay-screen');
    if(gameScrn) gameScrn.style.display = 'flex';
    
    database.ref(`rooms/${currentWwRoomId}/players/${currentWwPlayerId}/role`).once('value', snap => { 
        myRoleInfo = snap.val(); 
        const card = document.getElementById('ww-my-card');
        if(card) card.innerText = myRoleInfo; 
    });

    if (phase === 'revealing') {
        const title = document.getElementById('ww-phase-title');
        if(title) title.innerText = "NHẬN VAI TRÒ";
        const timer = document.getElementById('ww-timer-display');
        if(timer) timer.innerText = "--:--";
        return;
    }

    if (phase === 'night') {
        if(gameScrn) gameScrn.className = 'screen-container ww-night-bg'; 
        const title = document.getElementById('ww-phase-title');
        if(title) { title.innerText = "BAN ĐÊM"; title.style.color = "#bdc3c7"; }
        const voteBtn = document.getElementById('ww-btn-vote-day');
        if(voteBtn) voteBtn.style.display = 'none';
        
    } else if (phase === 'day') {
        if(gameScrn) gameScrn.className = 'screen-container ww-day-bg'; 
        const title = document.getElementById('ww-phase-title');
        if(title) { title.innerText = "BAN NGÀY"; title.style.color = "#ffd700"; }
        const voteBtn = document.getElementById('ww-btn-vote-day');
        if(voteBtn) voteBtn.style.display = 'block';
        closeModal('overlay-ww-action'); closeModal('overlay-ww-villager');
    }
}

function flipMyWwCard() { 
    playSfx('flip'); 
    const c = document.getElementById('ww-my-card'); 
    if(!c) return;
    if (c.classList.contains('facedown')) {
        c.classList.remove('facedown');
        if (!myHasRevealed && currentWwRoomId) {
            myHasRevealed = true;
            database.ref(`rooms/${currentWwRoomId}/players/${currentWwPlayerId}`).update({ hasRevealed: true });
        }
    } else {
        c.classList.add('facedown'); 
    }
}
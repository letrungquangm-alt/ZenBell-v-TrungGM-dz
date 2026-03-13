// =========================================
// 6. YOUTUBE API & TRÌNH PHÁT NHẠC
// =========================================
let ytPlayer; 
window.isPlayingYt = false; 
window.currentYtId = "";

const tag = document.createElement('script'); 
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0]; 
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() { 
    ytPlayer = new YT.Player('youtube-player-container', { 
        height: '10', 
        width: '10', 
        videoId: '', 
        playerVars: { 'playsinline': 1, 'controls': 0, 'disablekb': 1 }, 
        events: { 
            'onStateChange': (event) => { 
                if (event.data === YT.PlayerState.ENDED) { 
                    if (isShuffleMode) playRandomSong(); 
                    else if (!isShuffleMode && ytPlayer) ytPlayer.playVideo(); 
                } 
            } 
        } 
    }); 
}

function globalTogglePlayPause() { 
    playSfx('click'); 
    if (window.isPlayingYt && ytPlayer) { 
        if (ytPlayer.getPlayerState() === 1) { 
            ytPlayer.pauseVideo(); 
            window.isUserPaused = true; 
        } else { 
            ytPlayer.playVideo(); 
            window.isUserPaused = false; 
        }
    } else { 
        if(localAudio.paused) { 
            localAudio.play().catch(e => {}); 
            window.isUserPaused = false; 
        } else { 
            localAudio.pause(); 
            window.isUserPaused = true; 
        }
    } 
}

function globalManualSeek(val) { 
    if (window.isPlayingYt && ytPlayer && ytPlayer.getDuration) {
        ytPlayer.seekTo((val / 100) * ytPlayer.getDuration(), true); 
    } else if (!window.isPlayingYt && localAudio.duration) {
        localAudio.currentTime = (val / 100) * localAudio.duration; 
    }
}

function globalSeekRelative(off) { 
    playSfx('click'); 
    if (window.isPlayingYt && ytPlayer && ytPlayer.getCurrentTime) {
        ytPlayer.seekTo(ytPlayer.getCurrentTime() + off, true); 
    } else if (!window.isPlayingYt) {
        localAudio.currentTime += off; 
    }
}

function skipYtAd() { 
    playSfx('click'); 
    if(window.isPlayingYt && ytPlayer && window.currentYtId) { 
        let timeToResume = window.safeYtTime || 0; 
        if(ytPlayer.stopVideo) ytPlayer.stopVideo(); 
        if(ytPlayer.loadVideoById) { 
            ytPlayer.loadVideoById('z_hwZkZYxKA'); 
            setTimeout(() => { 
                ytPlayer.loadVideoById({videoId: window.currentYtId, startSeconds: timeToResume}); 
            }, 300); 
        } 
    } 
}

function startProgressTimer() { 
    clearInterval(progressInterval); 
    progressInterval = setInterval(() => { 
        let cur = 0, dur = 0, isAd = false;
        
        if (window.isPlayingYt && ytPlayer && ytPlayer.getVideoData) {
            let vData = ytPlayer.getVideoData();
            let playingId = vData ? vData.video_id : null;
            isAd = (playingId && window.currentYtId && playingId !== window.currentYtId);
            
            if (!isAd) { 
                if(ytPlayer.getCurrentTime) window.safeYtTime = ytPlayer.getCurrentTime(); 
                window.adTick = 0; 
                window.lastAdId = null; 
            } else { 
                if (window.lastAdId !== playingId) { 
                    window.adTick = 0; 
                    window.lastAdId = playingId; 
                } 
            }
        }
        
        let btnSkip = $('btn-skip-ad');
        let btnPlay = $('btn-play-pause');
        
        if (isAd) {
            if (typeof window.adTick === 'undefined') window.adTick = 0; 
            window.adTick += 0.5; 
            let timeLeft = Math.ceil(6 - window.adTick); 
            
            if (btnSkip) { 
                btnSkip.style.display = "inline-block"; 
                btnSkip.style.pointerEvents = "none"; 
                btnSkip.style.border = "none"; 
                if (timeLeft > 0) { 
                    btnSkip.innerText = `⏳ QC: ${timeLeft}s`; 
                    btnSkip.style.color = "#fff"; 
                    btnSkip.style.opacity = "0.7"; 
                } else { 
                    btnSkip.innerText = `Nhấn ⏭`; 
                    btnSkip.style.color = "#e74c3c"; 
                    btnSkip.style.opacity = "1"; 
                } 
            }
            
            if (btnPlay) { 
                btnPlay.innerText = "⏭"; 
                btnPlay.style.paddingLeft = "0px"; 
                if (timeLeft > 0) { 
                    btnPlay.style.opacity = "0.5"; 
                    btnPlay.style.pointerEvents = "none"; 
                    btnPlay.onclick = null; 
                } else { 
                    btnPlay.style.opacity = "1"; 
                    btnPlay.style.pointerEvents = "auto"; 
                    btnPlay.onclick = skipYtAd; 
                } 
            }
        } else {
            if (btnSkip) btnSkip.style.display = "none"; 
            window.adTick = 0;
            if (btnPlay) { 
                btnPlay.onclick = globalTogglePlayPause; 
                btnPlay.style.opacity = "1"; 
                btnPlay.style.pointerEvents = "auto"; 
            }
        }
        
        if (window.isPlayingYt && ytPlayer && ytPlayer.setVolume) { 
            ytPlayer.setVolume(localAudio.volume * 100); 
            if(ytPlayer.getPlaybackRate && ytPlayer.getPlaybackRate() !== currentPlaybackSpeed) {
                ytPlayer.setPlaybackRate(currentPlaybackSpeed); 
            }
        } 
        
        if (!isAd) {
            if (window.isPlayingYt && ytPlayer && ytPlayer.getCurrentTime) { 
                cur = ytPlayer.getCurrentTime() || 0; 
                dur = ytPlayer.getDuration() || 0; 
                let state = ytPlayer.getPlayerState(); 
                let isPaused = (state !== 1 && state !== 3); 
                if(btnPlay) { 
                    btnPlay.innerText = isPaused ? "▶" : "❚❚"; 
                    btnPlay.style.paddingLeft = isPaused ? "3px" : "0px"; 
                } 
            } else if (!window.isPlayingYt && localAudio.src) { 
                cur = localAudio.currentTime; 
                dur = localAudio.duration; 
                if(btnPlay) { 
                    btnPlay.innerText = localAudio.paused ? "▶" : "❚❚"; 
                    btnPlay.style.paddingLeft = localAudio.paused ? "3px" : "0px"; 
                } 
            } 
            
            if(dur > 0 && !isNaN(dur)) { 
                let ct = $('current-time');
                let dt = $('duration-time');
                let sb = $('music-seek-bar'); 
                if(ct) ct.innerText = formatTime(cur); 
                if(dt) dt.innerText = formatTime(dur); 
                if(sb && document.activeElement !== sb) sb.value = (cur / dur) * 100; 
            }
        } 
    }, 500); 
}

const speedDragger = $('speed-dragger'); 
let isDraggingSpeed = false, startDragX = 0;

if(speedDragger) { 
    speedDragger.addEventListener('pointerdown', e => { 
        isDraggingSpeed = true; 
        startDragX = e.clientX; 
        speedDragger.style.background = 'rgba(255,215,0,0.3)'; 
        speedDragger.setPointerCapture(e.pointerId); 
    });
    speedDragger.addEventListener('pointermove', e => { 
        if(!isDraggingSpeed) return; 
        let dx = e.clientX - startDragX; 
        if(Math.abs(dx) > 30) { 
            if(dx > 0) currentPlaybackSpeed += 0.25; 
            else currentPlaybackSpeed -= 0.25; 
            currentPlaybackSpeed = Math.max(0.5, Math.min(2.0, currentPlaybackSpeed)); 
            speedDragger.innerText = currentPlaybackSpeed.toFixed(2) + 'x'; 
            localAudio.playbackRate = currentPlaybackSpeed; 
            startDragX = e.clientX; 
            playSfx('click'); 
        } 
    });
    speedDragger.addEventListener('pointerup', e => { 
        isDraggingSpeed = false; 
        speedDragger.style.background = 'rgba(255,255,255,0.1)'; 
        speedDragger.releasePointerCapture(e.pointerId); 
    }); 
}

// =========================================
// 7. LOGIC QUẢN LÝ KHO NHẠC TIÊN CUNG
// =========================================
const MUSIC_LIBRARY_DEFAULTS = { 
    "starboy": { name: "Starboy", data: "./music/Star-Boy.m4a", type: "local" }, 
    "attention": { name: "Attention", data: "./music/Attention.m4a", type: "local" }, 
    "hk1999": { name: "Dạo Bước HK 1999", data: "./music/Dao-Buoc-HK-1999.m4a", type: "local" }, 
    "3strikes": { name: "3 Strikes", data: "./music/3-STRIKES.m4a", type: "local" }, 
    "daylight": { name: "Daylight", data: "./music/Daylight.m4a", type: "local" }, 
    "goldenhour": { name: "Golden Hour", data: "./music/golden-hour.m4a", type: "local" }, 
    "cheatingonu": { name: "Cheating on You", data: "./music/Cheating-on-You.m4a", type: "local" }, 
    "howlong": { name: "How Long", data: "./music/How-Long.m4a", type: "local" }, 
    "diewithasmile": { name: "Die With A Smile", data: "./music/Die-With-A-Smile.m4a", type: "local" },
    "dangerously": { name: "Dangerously", data: "./music/Dangerously.m4a", type: "local" }
};

let ALL_MUSIC_LIST = [];
let currentMusicPage = 0;
let selectedSongsForDeletion = [];
let isDeleteMode = false;
let userMusicConfig = JSON.parse(localStorage.getItem('user_music_cfg_v17')) || { menu: "starboy", game: "attention" };
let isShuffleMode = false;
let currentMusicKey = null;
let tempBase64Data = "";
let tempDefaultName = "";
let tempYtId = "";

async function preLoadMusicDatabase() { 
    ALL_MUSIC_LIST = []; 
    for (let k in MUSIC_LIBRARY_DEFAULTS) {
        ALL_MUSIC_LIST.push({ id: k, name: MUSIC_LIBRARY_DEFAULTS[k].name, isDefault: true });
    }
    try { 
        const s = await getAllCustomSongsFromDB(); 
        if(s) s.forEach(x => ALL_MUSIC_LIST.push({ id: x.id, name: x.name, isDefault: false })); 
    } catch(e) {} 
}

window.addEventListener('load', () => { 
    initDB(); 
    preLoadMusicDatabase(); 
});

async function openMusicLibraryModal() { 
    closeModal('overlay-settings'); 
    openModal('overlay-music-lib'); 
    try { await preLoadMusicDatabase(); } catch(e) {} 
    selectedSongsForDeletion = []; 
    isDeleteMode = false; 
    renderMusicPages(); 
}

function closeMusicModal() { 
    closeModal('overlay-music-lib'); 
    if(!isShuffleMode && !window.isUserPaused) playMasterMusic('menu'); 
}

function renderMusicPages() {
    const carousel = $('music-carousel'); 
    carousel.innerHTML = '';
    const total = ALL_MUSIC_LIST.length;
    const per = 5;
    const pages = Math.ceil(total / per);
    
    if(isDeleteMode) carousel.classList.add('delete-mode-active'); 
    else carousel.classList.remove('delete-mode-active');
    
    for (let p = 0; p < pages; p++) {
        let div = document.createElement('div'); 
        div.className = 'music-page'; 
        
        for (let i = p * per; i < Math.min((p + 1) * per, total); i++) {
            const s = ALL_MUSIC_LIST[i];
            let isM = userMusicConfig.menu === s.id;
            let isG = userMusicConfig.game === s.id;
            let isB = isM && isG;
            
            let border = isB ? '#2ecc71' : (isM ? '#d4af37' : (isG ? 'cyan' : '#6b0000'));
            let bM = isM && !isB ? '#d4af37' : '#444';
            let bG = isG && !isB ? 'cyan' : '#444';
            let bB = isB ? '#2ecc71' : '#444';
            
            if(isShuffleMode) { 
                bM = '#d4af37'; 
                bG = 'cyan'; 
                bB = '#2ecc71'; 
                border = '#6b0000'; 
            }
            
            let extra = currentMusicKey === s.id ? "music-row-rgb" : (isShuffleMode ? "music-row-dimmed" : "");
            let cb = !s.isDefault ? `<input type="checkbox" class="music-checkbox" value="${s.id}" onchange="toggleDeleteSelection(this)" ${selectedSongsForDeletion.includes(s.id) ? 'checked' : ''}>` : '';
            
            div.innerHTML += `
                <div class="music-item-row ${extra}" style="border: 2px solid ${border};">
                    <div class="music-left-group">${cb}<span class="music-name-txt">${s.name}</span></div>
                    <div style="display:flex; gap:5px;">
                        <button class="btn-music-config" onclick="setMusicTarget('${s.id}', 'menu')" style="background:${bM}; color:#000;">M</button>
                        <button class="btn-music-config" onclick="setMusicTarget('${s.id}', 'game')" style="background:${bG}; color:#000;">G</button>
                        <button class="btn-music-config" onclick="setMusicTarget('${s.id}', 'both')" style="background:${bB}; color:#000;">∞</button>
                    </div>
                </div>`;
        }
        carousel.appendChild(div);
    }
    renderPaginationControls(pages); 
    updateDeleteButtonState();
}

function renderPaginationControls(pages) { 
    const pag = $('music-pagination'); 
    pag.innerHTML = ''; 
    if(pages <= 1) return; 
    for (let i = 0; i < pages; i++) {
        pag.innerHTML += `<div class="page-btn ${i === currentMusicPage ? 'active' : ''}" onclick="goToMusicPage(${i})">${i + 1}</div>`; 
    }
}

function goToMusicPage(i) { 
    const carousel = $('music-carousel'); 
    currentMusicPage = i; 
    carousel.scrollTo({ left: carousel.clientWidth * i, behavior: 'smooth' }); 
    document.querySelectorAll('#music-pagination .page-btn').forEach((btn, idx) => { 
        if (idx === i) btn.classList.add('active'); 
        else btn.classList.remove('active'); 
    }); 
}

if($('music-carousel')) {
    $('music-carousel').addEventListener('scroll', function() { 
        let idx = Math.round(this.scrollLeft / this.clientWidth); 
        if (idx !== currentMusicPage) { 
            currentMusicPage = idx; 
            document.querySelectorAll('#music-pagination .page-btn').forEach((btn, i) => { 
                if (i === idx) btn.classList.add('active'); 
                else btn.classList.remove('active'); 
            }); 
        } 
    });
}

function setMusicTarget(k, t) { 
    playSfx('click'); 
    if(t === 'both') { 
        userMusicConfig.menu = k; 
        userMusicConfig.game = k; 
    } else if(t === 'menu') { 
        userMusicConfig.menu = k; 
        if(userMusicConfig.game === k) userMusicConfig.game = null; 
    } else if(t === 'game') { 
        userMusicConfig.game = k; 
        if(userMusicConfig.menu === k) userMusicConfig.menu = null; 
    } 
    localStorage.setItem('user_music_cfg_v17', JSON.stringify(userMusicConfig)); 
    
    window.isUserPaused = false; 
    if(!isShuffleMode) playMasterMusic(t === 'both' ? 'menu' : t); 
    renderMusicPages(); 
}

function handleMusicUpload(e) { 
    const f = e.target.files[0]; 
    if(!f) return; 
    tempDefaultName = f.name.split('.')[0].substring(0, 25); 
    const r = new FileReader(); 
    r.onload = (ev) => { 
        tempBase64Data = ev.target.result; 
        e.target.value = ''; 
        openModal('overlay-name-input'); 
    }; 
    r.readAsDataURL(f); 
}

function cancelMusicUpload() { 
    tempBase64Data = ""; 
    closeModal('overlay-name-input'); 
}

async function confirmMusicUpload() { 
    let n = $('custom-song-name').value.trim() || tempDefaultName; 
    try { 
        await saveCustomSongToDB("c_" + Date.now(), n, tempBase64Data, "local"); 
        closeModal('overlay-name-input'); 
        tempBase64Data = ""; 
        await preLoadMusicDatabase(); 
        renderMusicPages(); 
        goToMusicPage(Math.ceil(ALL_MUSIC_LIST.length / 5) - 1); 
    } catch(err) {} 
}

function openYtLinkModal() { 
    $('yt-link-input').value = ''; 
    openModal('overlay-yt-link'); 
}

function validateYtLink() { 
    let url = $('yt-link-input').value; 
    let ytId = ""; 
    let match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/); 
    if (match && match[1]) ytId = match[1]; 
    else if (url.trim().length === 11) ytId = url.trim(); 
    
    if (!ytId) { 
        customAlert("THÁNH CHỈ", "Đường dẫn không hợp lệ, vui lòng nhập lại!", "TUÂN CHỈ"); 
        return; 
    } 
    tempYtId = ytId; 
    closeModal('overlay-yt-link'); 
    $('yt-name-input').value = 'Khúc Nhạc YouTube'; 
    openModal('overlay-yt-name'); 
}

async function confirmYtMusic() { 
    let n = $('yt-name-input').value.trim() || "Khúc Nhạc YouTube"; 
    try { 
        await saveCustomSongToDB("c_" + Date.now(), n, 'yt:' + tempYtId, "youtube"); 
        closeModal('overlay-yt-name'); 
        await preLoadMusicDatabase(); 
        renderMusicPages(); 
        goToMusicPage(Math.ceil(ALL_MUSIC_LIST.length / 5) - 1); 
    } catch(err) { 
        customAlert("LỖI", "Không thể ghi danh khúc nhạc này!", "ĐÃ HIỂU"); 
    } 
}

function toggleDeleteMode() { 
    isDeleteMode = !isDeleteMode; 
    if(!isDeleteMode && selectedSongsForDeletion.length > 0) executeDeleteSelected(); 
    else renderMusicPages(); 
}

function toggleDeleteSelection(cb) { 
    if(cb.checked) selectedSongsForDeletion.push(cb.value); 
    else selectedSongsForDeletion = selectedSongsForDeletion.filter(i => i !== cb.value); 
    updateDeleteButtonState(); 
}

function updateDeleteButtonState() { 
    const btn = $('btn-delete-music'); 
    if (!isDeleteMode) { 
        btn.innerText = "XÓA NHẠC"; 
        btn.style.background = "#6b0000"; 
        btn.style.color = "#fff"; 
    } else if(selectedSongsForDeletion.length === 0) { 
        btn.innerText = "HỦY XÓA"; 
        btn.style.background = "#2b0000"; 
        btn.style.color = "#d4af37"; 
    } else { 
        btn.innerText = `XÓA (${selectedSongsForDeletion.length})`; 
        btn.style.background = "#e74c3c"; 
        btn.style.color = "#fff"; 
    } 
}

async function executeDeleteSelected() { 
    await deleteSongsFromDB(selectedSongsForDeletion); 
    selectedSongsForDeletion = []; 
    isDeleteMode = false; 
    await preLoadMusicDatabase(); 
    renderMusicPages(); 
}

function toggleShuffleMode() { 
    playSfx('click'); 
    isShuffleMode = !isShuffleMode; 
    window.isUserPaused = false; 
    const btn = $('btn-shuffle-music'); 
    if(isShuffleMode) { 
        btn.classList.add('btn-shuffle-active'); 
        btn.innerText = "ĐANG TRÁO"; 
        playRandomSong(); 
    } else { 
        btn.classList.remove('btn-shuffle-active'); 
        btn.innerText = "TRÁO NHẠC"; 
        playMasterMusic('menu'); 
    } 
    renderMusicPages(); 
}

function playRandomSong() { 
    if(window.isUserPaused || ALL_MUSIC_LIST.length === 0) return; 
    const s = ALL_MUSIC_LIST[Math.floor(Math.random() * ALL_MUSIC_LIST.length)]; 
    currentMusicKey = s.id; 
    if(MUSIC_LIBRARY_DEFAULTS[s.id]) {
        executePlayMusic(s.id, MUSIC_LIBRARY_DEFAULTS[s.id].data); 
    } else {
        getSongDataFromDB(s.id).then(d => { 
            if(d) executePlayMusic(s.id, d.data); 
        }); 
    }
    renderMusicPages(); 
}

function playMasterMusic(t) { 
    if(isShuffleMode || window.isUserPaused) return; 
    const k = userMusicConfig[t]; 
    gsap.killTweensOf(localAudio);
    
    if(!k) { 
        gsap.to(localAudio, { 
            volume: 0, 
            duration: 1, 
            onComplete: () => { 
                localAudio.pause(); 
                if(ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo(); 
                currentMusicKey = null; 
                renderMusicPages(); 
            } 
        }); 
        return; 
    }
    
    if (currentMusicKey === k) { 
        if (window.isPlayingYt && ytPlayer) { 
            if(ytPlayer.getPlayerState() !== 1) ytPlayer.playVideo(); 
        } else if (localAudio.src) { 
            if (localAudio.paused) localAudio.play().catch(e=>{}); 
        } 
        gsap.to(localAudio, { volume: bgmVolume, duration: 1 }); 
        return; 
    }
    
    gsap.to(localAudio, { 
        volume: 0, 
        duration: 1, 
        onComplete: () => { 
            currentMusicKey = k; 
            localAudio.volume = 0; 
            renderMusicPages(); 
            const playAndFadeIn = (songId, songData) => { 
                executePlayMusic(songId, songData); 
                gsap.to(localAudio, { volume: bgmVolume, duration: 1.5, ease: "power1.inOut" }); 
            }; 
            if(MUSIC_LIBRARY_DEFAULTS[k]) {
                playAndFadeIn(k, MUSIC_LIBRARY_DEFAULTS[k].data || ''); 
            } else {
                getSongDataFromDB(k).then(d => { 
                    if(d) playAndFadeIn(k, d.data || ''); 
                }); 
            }
        } 
    });
}

function executePlayMusic(k, d) { 
    if(!d || d.includes('[[')) { 
        $('custom-player-ui').style.display = 'none'; 
        localAudio.pause(); 
        if(ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo(); 
        return; 
    }
    
    $('custom-player-ui').style.display = 'flex'; 
    gsap.killTweensOf(localAudio); 
    localAudio.volume = bgmVolume; 
    localAudio.pause(); 
    if(ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo(); 
    
    localAudio.loop = !isShuffleMode; 
    currentPlaybackSpeed = 1.0;
    
    let songObj = ALL_MUSIC_LIST.find(x => x.id === k); 
    if($('now-playing-text')) {
        $('now-playing-text').innerHTML = "🎵 Đang phát: " + (songObj ? songObj.name : "Nhạc") + " 🎵"; 
    }
    if($('speed-dragger')) {
        $('speed-dragger').innerText = "1.0x"; 
    }
    
    window.isPlayingYt = d.startsWith('yt:'); 
    if($('btn-skip-ad')) {
        $('btn-skip-ad').style.display = window.isPlayingYt ? "block" : "none"; 
    }
    
    startProgressTimer(); 
    window.isUserPaused = false; 
    
    try { 
        if(window.isPlayingYt) { 
            window.currentYtId = d.replace('yt:', ''); 
            if(ytPlayer && ytPlayer.loadVideoById) { 
                ytPlayer.loadVideoById(window.currentYtId); 
                ytPlayer.setVolume(bgmVolume * 100); 
            } else {
                setTimeout(() => executePlayMusic(k, d), 1000); 
            }
        } else { 
            const isUrlOrPath = d.startsWith('http') || d.startsWith('data:') || d.startsWith('./') || d.startsWith('/'); 
            if(isUrlOrPath) { 
                localAudio.src = new URL(d, window.location.href).href; 
                localAudio.play().catch(e => {}); 
            } else { 
                const byteChars = atob(d);
                const byteNums = new Array(byteChars.length); 
                for (let i = 0; i < byteChars.length; i++) {
                    byteNums[i] = byteChars.charCodeAt(i); 
                }
                localAudio.src = URL.createObjectURL(new Blob([new Uint8Array(byteNums)], {type: 'audio/mp3'})); 
                localAudio.play().catch(e => {}); 
            } 
        }
    } catch(e) { 
        $('custom-player-ui').style.display = 'none'; 
    } 
}

localAudio.addEventListener('ended', () => { 
    if(isShuffleMode && !window.isUserPaused) playRandomSong(); 
});
// =========================================
// 4. QUẢN LÝ CÀI ĐẶT (GIAO DIỆN & MÀU SẮC)
// =========================================
function processAndSaveImage(i, k, cb) { 
    const f = $(i).files[0]; 
    if(!f) { 
        if(cb) cb(); 
        return; 
    } 
    const r = new FileReader(); 
    r.onload = (e) => { 
        const img = new Image(); 
        img.onload = () => { 
            const cv = document.createElement('canvas');
            const cx = cv.getContext('2d'); 
            let w = img.width;
            let h = img.height;
            let MAX = 800; 
            
            if(w > h && w > MAX) { 
                h *= MAX / w; 
                w = MAX; 
            } else if(h > MAX) { 
                w *= MAX / h; 
                h = MAX; 
            } 
            
            cv.width = w; 
            cv.height = h; 
            cx.drawImage(img, 0, 0, w, h); 
            
            try { 
                localStorage.setItem(k, cv.toDataURL('image/jpeg', 0.6)); 
                if(cb) cb(); 
            } catch(err) { 
                if(cb) cb(); 
            } 
        }; 
        img.src = e.target.result; 
    }; 
    r.readAsDataURL(f); 
}

function loadSavedSettings() { 
    $('vol-bgm').value = bgmVolume; 
    $('vol-sfx').value = sfxVolume;
    
    const r = document.documentElement; 
    const keys = ['cfg_bg','cfg_brd','cfg_bdr','cfg_txt','cfg_btn'];
    const props = ['--game-bg-color','--game-board-color','--game-border-color','--game-text-color','--game-btn-color'];
    
    keys.forEach((k, i) => { 
        const v = localStorage.getItem(k); 
        if(v) { 
            r.style.setProperty(props[i], v); 
            const inp = $(k.replace('_', '-')); 
            if(inp) inp.value = v; 
            if(k === 'cfg_btn') r.style.setProperty('--game-btn-shadow', calculateShadow(v, -35)); 
        } 
    });
    
    const bg = localStorage.getItem('bg_v4'); 
    if(bg) { 
        document.body.style.backgroundImage = `url("${bg}")`; 
        $('bg-overlay').style.display = 'block'; 
    } 
    
    const cd = localStorage.getItem('cd_v4'); 
    if(cd) { 
        document.documentElement.style.setProperty('--custom-card-back', `url("${cd}")`); 
        if($('deck-back-face')) {
            $('deck-back-face').style.backgroundImage = 'none'; 
        }
    } 
}

function executeSaveSettings() { 
    localStorage.setItem('vol_bgm', bgmVolume); 
    localStorage.setItem('vol_sfx', sfxVolume); 
    
    const ids = ['cfg-bg','cfg-board','cfg-border','cfg-text','cfg-btn'];
    const keys = ['cfg_bg','cfg_brd','cfg_bdr','cfg_txt','cfg_btn'];
    
    ids.forEach((id, i) => { 
        localStorage.setItem(keys[i], $(id).value); 
    }); 
    
    processAndSaveImage('upload-bg', 'bg_v4', () => { 
        processAndSaveImage('upload-card', 'cd_v4', () => { 
            loadSavedSettings(); 
            closeModal('overlay-settings'); 
        }); 
    });
}

function clearSavedData() { 
    localStorage.clear(); 
    indexedDB.deleteDatabase(DB_NAME); 
    location.reload(); 
}

loadSavedSettings();

// =========================================
// 5. LOGIC CHUYỂN MÀN HÌNH
// =========================================
function switchScreen(target, btn) { 
    if(btn) { 
        const drop = $('water-drop-fx');
        const rect = btn.getBoundingClientRect(); 
        drop.style.left = (rect.left + rect.width / 2) + 'px'; 
        drop.style.top = (rect.top + rect.height / 2) + 'px'; 
        drop.classList.remove('water-drop-active'); 
        void drop.offsetWidth; 
        drop.classList.add('water-drop-active'); 
    } 
    
    const glow = $('glow-transition'); 
    glow.style.display = 'block';
    
    gsap.to(glow, { 
        opacity: 1, 
        duration: 0.3, 
        onComplete: () => { 
            document.querySelectorAll('.screen-container').forEach(el => el.style.display = 'none'); 
            $(target).style.display = 'flex'; 
            gsap.to(glow, { opacity: 0, duration: 0.3, onComplete: () => glow.style.display = 'none' }); 
        } 
    });
}

function hubClick(type, btn) { 
    if(type === 'duaxi') {
        customAlert("THÁNH CHỈ", "Mời bạn giá lâm trường đua. Cẩn trọng cạm bẫy trên đường tranh đoạt ngai vàng!", "TUÂN CHỈ", () => switchScreen('menu-screen', btn)); 
    } else {
        customAlert("THÁNH CHỈ", "Nơi đây là Bách Hí Viện, giúp bạn giải khuây sau những giờ căng thẳng.", "TUÂN CHỈ", () => switchScreen('mini-game-menu-screen', btn)); 
    }
}

function navigateMainMenu(targetId, btnEl) { 
    switchScreen(targetId, btnEl); 
}

function quitToScreen(target) { 
    if(typeof SnakeGame !== 'undefined') SnakeGame.stop(); 
    if(typeof TetrisGame !== 'undefined') TetrisGame.stop(); 
    if(typeof ChickenGame !== 'undefined') ChickenGame.stop(); 
    closeModal('overlay-victory'); 
    switchScreen(target);
    
    if(target === 'main-hub-screen' || target === 'menu-screen' || target === 'mini-game-menu-screen') { 
        if(!window.isUserPaused) {
            playMasterMusic('menu'); 
        }
    }
}
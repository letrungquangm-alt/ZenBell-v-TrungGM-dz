// =========================================
// 2. HỆ THỐNG ÂM THANH TIÊN CUNG
// =========================================
const localAudio = document.getElementById('local-audio-player'); 
let audioCtx; 

let bgmVolume = parseFloat(localStorage.getItem('vol_bgm')) || 0.5;
let sfxVolume = parseFloat(localStorage.getItem('vol_sfx')) || 0.7; 

$('vol-bgm').value = bgmVolume; 
$('vol-sfx').value = sfxVolume; 

$('vol-bgm').addEventListener('input', e => { 
    bgmVolume = parseFloat(e.target.value); 
    localAudio.volume = bgmVolume; 
    if(typeof ytPlayer !== 'undefined' && ytPlayer.setVolume) {
        ytPlayer.setVolume(bgmVolume * 100);
    }
    localStorage.setItem('vol_bgm', bgmVolume);
});

$('vol-sfx').addEventListener('input', e => { 
    sfxVolume = parseFloat(e.target.value); 
    localStorage.setItem('vol_sfx', sfxVolume);
}); 

function initSound() { 
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume(); 
    }
    localAudio.volume = bgmVolume; 
} 

function playSfx(type) { 
    if (!audioCtx) return;
    
    const t = audioCtx.currentTime;
    const gain = audioCtx.createGain(); 
    gain.connect(audioCtx.destination); 
    let v = sfxVolume;

    if (type === 'flip' || type === 'deal') { 
        const b = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.05, audioCtx.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
            d[i] = Math.random() * 2 - 1; 
        }
        const s = audioCtx.createBufferSource(); 
        s.buffer = b; 
        const f = audioCtx.createBiquadFilter(); 
        f.type = 'highpass'; 
        f.frequency.value = 800; 
        
        s.connect(f); 
        f.connect(gain); 
        
        gain.gain.setValueAtTime(v * 0.8, t); 
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05); 
        s.start(t); 
        return; 
    } 

    const osc = audioCtx.createOscillator(); 
    osc.connect(gain);

    if (type === 'click' || type === 'move') { 
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(800, t); 
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
        gain.gain.setValueAtTime(v * 0.4, t); 
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05); 
        osc.start(t); 
        osc.stop(t + 0.05); 
    } 
    else if (type === 'eat' || type === 'shoot') { 
        osc.type = 'square'; 
        osc.frequency.setValueAtTime(400, t); 
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.1); 
        gain.gain.setValueAtTime(v * 0.1, t); 
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1); 
        osc.start(t); 
        osc.stop(t + 0.1); 
    } 
    else if (type === 'boom' || type === 'error') { 
        osc.type = 'sawtooth'; 
        osc.frequency.setValueAtTime(150, t); 
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.3); 
        gain.gain.setValueAtTime(v * 0.4, t); 
        gain.gain.linearRampToValueAtTime(0.01, t + 0.3); 
        osc.start(t); 
        osc.stop(t + 0.3); 
    } 
    else if (type === 'warn') { 
        osc.type = 'square'; 
        osc.frequency.setValueAtTime(1200, t); 
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.1); 
        gain.gain.setValueAtTime(v * 0.2, t); 
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1); 
        osc.start(t); 
        osc.stop(t + 0.1); 
    } 
    else if (type === 'win') { 
        osc.type = 'square'; 
        osc.frequency.setValueAtTime(440, t); 
        osc.frequency.setValueAtTime(554.37, t + 0.1); 
        osc.frequency.setValueAtTime(659.25, t + 0.2); 
        osc.frequency.setValueAtTime(880, t + 0.3); 
        gain.gain.setValueAtTime(v * 0.3, t); 
        gain.gain.linearRampToValueAtTime(0.01, t + 0.6); 
        osc.start(t); 
        osc.stop(t + 0.6); 
    } 
    else if (type === 'lose') { 
        osc.type = 'triangle'; 
        osc.frequency.setValueAtTime(392, t); 
        osc.frequency.setValueAtTime(369, t + 0.25); 
        gain.gain.setValueAtTime(v * 0.5, t); 
        gain.gain.linearRampToValueAtTime(0.01, t + 2); 
        osc.start(t); 
        osc.stop(t + 2); 
    } 
    else if (type === 'ting') { 
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(1500, t); 
        gain.gain.setValueAtTime(v * 0.15, t); 
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1); 
        osc.start(t); 
        osc.stop(t + 0.1); 
    } 
    else if (type === 'swoosh') { 
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(250, t); 
        gain.gain.setValueAtTime(v * 0.1, t); 
        gain.gain.linearRampToValueAtTime(0.01, t + 0.4); 
        osc.start(t); 
        osc.stop(t + 0.4); 
    } 
}

document.addEventListener('click', e => { 
    initSound(); 
    if(e.target.closest('.ui-btn') || e.target.tagName.toLowerCase() === 'button') {
        playSfx('click'); 
    }
});
// =========================================
// 1. BIẾN TOÀN CỤC & TIỆN ÍCH DOM
// =========================================
const playerCardImages = ['./image/bich.png', './image/chuon.png', './image/ro.png', './image/co.png'];
const trapCardImages = ['./image/bich1.png', './image/chuon1.png', './image/ro1.png', './image/co1.png'];

let progressInterval; 
let currentPlaybackSpeed = 1.0; 

// BIẾN QUAN TRỌNG: Khóa nhạc nếu người dùng tự tắt
window.isUserPaused = false; 

function $(id) { 
    return document.getElementById(id); 
} 

function openModal(id) { 
    $(id).style.display = 'flex'; 
} 

function closeModal(id) { 
    $(id).style.display = 'none'; 
} 

function switchTab(t) { 
    ['luat','choi'].forEach(function(i) { 
        $(`btn-tab-${i}`).classList.remove('active'); 
        $(`tab-${i}`).classList.remove('active'); 
    }); 
    $(`btn-tab-${t}`).classList.add('active'); 
    $(`tab-${t}`).classList.add('active'); 
} 

function customAlert(title, text, btnText, callback) { 
    $('alert-title').innerText = title; 
    $('alert-text').innerText = text; 
    $('alert-btn').innerText = btnText; 
    $('alert-btn').onclick = function() { 
        closeModal('overlay-custom-alert'); 
        if(callback) callback(); 
    }; 
    openModal('overlay-custom-alert'); 
}

function formatTime(s) { 
    if(!s || isNaN(s)) return "00:00"; 
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60); 
    return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`; 
}

function calculateShadow(hex, p) { 
    if(!hex || hex.length < 7) hex = "#d4af37";
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    
    r = Math.floor(r * (100 + p) / 100); 
    g = Math.floor(g * (100 + p) / 100); 
    b = Math.floor(b * (100 + p) / 100); 
    
    return `rgb(${Math.max(0, r)},${Math.max(0, g)},${Math.max(0, b)})`; 
} 

function updateFileLabel(i, t, l) { 
    if($(i).files.length > 0) { 
        $(t).innerText = "ĐÃ CHỌN"; 
        $(l).style.background = "#d4af37"; 
        $(l).style.color = "#000"; 
    } 
}
// =========================================
// 3. DATABASE OFFLINE (LƯU NHẠC)
// =========================================
const DB_NAME = "DeNhatMusicDB_v17";
const STORE_NAME = "CustomSongs";

function initDB() { 
    return new Promise((res, rej) => { 
        const req = indexedDB.open(DB_NAME, 1); 
        req.onupgradeneeded = e => { 
            const db = e.target.result; 
            if(!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" }); 
            }
        }; 
        req.onsuccess = e => res(e.target.result); 
        req.onerror = e => rej(e.target.error); 
    }); 
}

async function saveCustomSongToDB(id, name, data, type) { 
    const db = await initDB();
    return new Promise((res, rej) => { 
        const trans = db.transaction([STORE_NAME], "readwrite");
        const store = trans.objectStore(STORE_NAME);
        const req = store.put({ id, name, data, type }); 
        req.onsuccess = () => res(); 
        req.onerror = () => rej(); 
    }); 
}

async function getAllCustomSongsFromDB() { 
    const db = await initDB(); 
    return new Promise((res, rej) => { 
        const trans = db.transaction([STORE_NAME], "readonly");
        const store = trans.objectStore(STORE_NAME);
        const req = store.getAll(); 
        req.onsuccess = () => res(req.result); 
        req.onerror = () => rej(); 
    }); 
}

async function deleteSongsFromDB(ids) { 
    const db = await initDB(); 
    return new Promise((res, rej) => { 
        const trans = db.transaction([STORE_NAME], "readwrite");
        const store = trans.objectStore(STORE_NAME); 
        ids.forEach(id => store.delete(id)); 
        trans.oncomplete = () => res(); 
        trans.onerror = () => rej(); 
    }); 
}

async function getSongDataFromDB(id) { 
    const db = await initDB(); 
    return new Promise((res, rej) => { 
        const trans = db.transaction([STORE_NAME], "readonly");
        const store = trans.objectStore(STORE_NAME);
        const req = store.get(id); 
        req.onsuccess = () => res(req.result); 
        req.onerror = () => rej(); 
    }); 
}
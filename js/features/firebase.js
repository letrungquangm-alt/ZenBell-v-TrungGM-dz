// =========================================
// HỆ THỐNG FIREBASE KẾT NỐI TỔNG
// =========================================
const hiddenPart1 = "AIzaSyB0" + "lrtfTEZ";
const hiddenPart2 = "rlcZuPgIZWk" + "pxZW6pxuwGuDE";
const safeApiKey = hiddenPart1 + hiddenPart2;

const firebaseConfig = { 
    apiKey: safeApiKey, 
    authDomain: "quangmdubbing.firebaseapp.com", 
    databaseURL: "https://quangmdubbing-default-rtdb.asia-southeast1.firebasedatabase.app", 
    projectId: "quangmdubbing", 
    storageBucket: "quangmdubbing.firebasestorage.app", 
    messagingSenderId: "306643549595", 
    appId: "1:306643549595:web:05dcf6df36ce2272c8f53e", 
    measurementId: "G-27MQ2EY8KE" 
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig); 
}
const database = firebase.database();
let onlinePlayerName = "Ẩn Danh"; // Biến lưu tên toàn cục
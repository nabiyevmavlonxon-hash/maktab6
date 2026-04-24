import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
  import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, serverTimestamp, updateDoc, setDoc, getDoc, onSnapshot, limit } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  const firebaseConfig = {
    apiKey: "AIzaSyANLJM2PZ_emDNzVTL_ZEnyppb70j5rH0Y",
    authDomain: "furqat6maktab-29681.firebaseapp.com",
    projectId: "furqat6maktab-29681",
    storageBucket: "furqat6maktab-29681.firebasestorage.app",
    messagingSenderId: "597415083181",
    appId: "1:597415083181:web:db266199762e2935aa1a24",
    measurementId: "G-TRJVHX4TVH"
  };
  export const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const db = getFirestore(app);

// app.js ichidagi eski funksiyalar ishlashi uchun global obyekt qoldirildi
window.FB = { auth, db, signInWithEmailAndPassword, signOut, onAuthStateChanged, collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, serverTimestamp, updateDoc, setDoc, getDoc, onSnapshot, limit };
onAuthStateChanged(auth, (user) => {
  window.currentUser = user;
  if (typeof window.onAuthChange === 'function') window.onAuthChange(user);
});
